"""
Workflow Templates and Reusability System.

This module provides a comprehensive template system for workflows including
inheritance, composition, versioning, and parameterization capabilities.
"""

import logging
import re
from datetime import datetime
from pathlib import Path
from typing import Any
from uuid import uuid4

import yaml
from pydantic import BaseModel

from .schema import (
    AgentRole,
    TaskDependency,
    ValidationGate,
    WorkflowDefinition,
    WorkflowStep,
    WorkflowTemplate,
    WorkflowType,
    WorkflowVersion,
)

logger = logging.getLogger(__name__)


class TemplateParameter(BaseModel):
    """Represents a template parameter with validation rules."""

    name: str
    type: str  # string, integer, float, boolean, array, object
    description: str
    required: bool = True
    default_value: Any = None
    validation_rules: dict[str, Any] = {}
    examples: list[Any] = []


class TemplateInheritanceResolver:
    """Handles template inheritance and composition."""

    def __init__(self, template_manager: 'WorkflowTemplateManager'):
        """Initialize with reference to template manager."""
        self.template_manager = template_manager
        self.resolution_cache: dict[str, WorkflowTemplate] = {}

    async def resolve_template_inheritance(
        self,
        template: WorkflowTemplate,
        visited: set[str] | None = None,
    ) -> WorkflowTemplate:
        """
        Resolve template inheritance chain.

        Args:
            template: Template to resolve
            visited: Set of visited templates (for circular reference detection)

        Returns:
            Fully resolved template with inheritance applied
        """
        if visited is None:
            visited = set()

        if template.template_id in visited:
            raise ValueError(f"Circular inheritance detected: {template.template_id}")

        # Check cache first
        cache_key = self._get_cache_key(template)
        if cache_key in self.resolution_cache:
            return self.resolution_cache[cache_key]

        visited.add(template.template_id)

        try:
            if template.parent_template_id:
                # Get parent template
                parent_template = await self.template_manager.get_template(template.parent_template_id)
                if not parent_template:
                    raise ValueError(f"Parent template not found: {template.parent_template_id}")

                # Resolve parent inheritance first
                resolved_parent = await self.resolve_template_inheritance(parent_template, visited.copy())

                # Merge parent into current template
                resolved_template = self._merge_templates(resolved_parent, template)
            else:
                resolved_template = template.model_copy(deep=True)

            # Cache the result
            self.resolution_cache[cache_key] = resolved_template
            return resolved_template

        finally:
            visited.discard(template.template_id)

    def _merge_templates(self, parent: WorkflowTemplate, child: WorkflowTemplate) -> WorkflowTemplate:
        """
        Merge parent template into child template.

        Child template values override parent values.
        Lists and dicts are merged intelligently.
        """
        # Start with parent as base
        merged = parent.model_copy(deep=True)

        # Override with child values
        merged.template_id = child.template_id
        merged.name = child.name
        merged.description = child.description
        merged.version = child.version
        merged.template_category = child.template_category
        merged.created_by = child.created_by
        merged.created_at = child.created_at
        merged.tags = list(set(merged.tags + child.tags))

        # Merge step templates (child steps override parent steps with same ID)
        parent_steps = {step.get("step_id"): step for step in merged.step_templates}
        for child_step in child.step_templates:
            step_id = child_step.get("step_id")
            if step_id:
                parent_steps[step_id] = child_step
            else:
                merged.step_templates.append(child_step)

        merged.step_templates = list(parent_steps.values())

        # Merge agent configurations
        for role, config in child.agent_configuration_template.items():
            if role in merged.agent_configuration_template:
                # Merge configuration dictionaries
                merged.agent_configuration_template[role].update(config)
            else:
                merged.agent_configuration_template[role] = config

        # Merge validation gate templates
        parent_gates = {gate.get("name"): gate for gate in merged.validation_gate_templates}
        for child_gate in child.validation_gate_templates:
            gate_name = child_gate.get("name")
            if gate_name:
                parent_gates[gate_name] = child_gate
            else:
                merged.validation_gate_templates.append(child_gate)

        merged.validation_gate_templates = list(parent_gates.values())

        # Merge parameters (child parameters override parent)
        merged.required_parameters = list(set(merged.required_parameters + child.required_parameters))
        merged.optional_parameters.update(child.optional_parameters)
        merged.parameter_validation.update(child.parameter_validation)

        return merged

    def _get_cache_key(self, template: WorkflowTemplate) -> str:
        """Generate cache key for template."""
        inheritance_chain = []
        current = template
        while current and current.parent_template_id:
            inheritance_chain.append(current.template_id)
            # This is simplified - in real implementation would load parent
            break

        return f"{template.template_id}:{':'.join(inheritance_chain)}:{template.version}"


class TemplateParameterValidator:
    """Validates and processes template parameters."""

    def validate_parameters(
        self,
        template: WorkflowTemplate,
        provided_parameters: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Validate provided parameters against template requirements.

        Args:
            template: Template with parameter definitions
            provided_parameters: Parameters provided for instantiation

        Returns:
            Validated and processed parameters

        Raises:
            ValueError: If validation fails
        """
        validated_params = {}
        errors = []

        # Check required parameters
        for required_param in template.required_parameters:
            if required_param not in provided_parameters:
                errors.append(f"Required parameter missing: {required_param}")

        # Validate and process all provided parameters
        all_params = {**template.optional_parameters, **provided_parameters}

        for param_name, param_value in all_params.items():
            try:
                validated_value = self._validate_single_parameter(
                    param_name, param_value, template.parameter_validation.get(param_name, {})
                )
                validated_params[param_name] = validated_value
            except ValueError as e:
                errors.append(f"Parameter '{param_name}': {e}")

        if errors:
            raise ValueError(f"Parameter validation failed: {'; '.join(errors)}")

        return validated_params

    def _validate_single_parameter(
        self, name: str, value: Any, validation_rules: dict[str, Any]
    ) -> Any:
        """Validate a single parameter value."""
        if not validation_rules:
            return value

        # Type validation
        expected_type = validation_rules.get("type")
        if expected_type:
            if not self._check_type(value, expected_type):
                raise ValueError(f"Expected type {expected_type}, got {type(value).__name__}")

        # Range validation for numbers
        if isinstance(value, (int, float)):
            min_val = validation_rules.get("min")
            max_val = validation_rules.get("max")
            if min_val is not None and value < min_val:
                raise ValueError(f"Value {value} is below minimum {min_val}")
            if max_val is not None and value > max_val:
                raise ValueError(f"Value {value} is above maximum {max_val}")

        # Length validation for strings and arrays
        if isinstance(value, (str, list)):
            min_length = validation_rules.get("min_length")
            max_length = validation_rules.get("max_length")
            if min_length is not None and len(value) < min_length:
                raise ValueError(f"Length {len(value)} is below minimum {min_length}")
            if max_length is not None and len(value) > max_length:
                raise ValueError(f"Length {len(value)} is above maximum {max_length}")

        # Pattern validation for strings
        if isinstance(value, str):
            pattern = validation_rules.get("pattern")
            if pattern and not re.match(pattern, value):
                raise ValueError(f"Value '{value}' does not match pattern '{pattern}'")

        # Enum validation
        allowed_values = validation_rules.get("allowed_values")
        if allowed_values and value not in allowed_values:
            raise ValueError(f"Value '{value}' not in allowed values: {allowed_values}")

        return value

    def _check_type(self, value: Any, expected_type: str) -> bool:
        """Check if value matches expected type."""
        type_mapping = {
            "string": str,
            "integer": int,
            "float": float,
            "boolean": bool,
            "array": list,
            "object": dict,
        }

        expected_python_type = type_mapping.get(expected_type)
        if not expected_python_type:
            return True  # Unknown type, skip validation

        return isinstance(value, expected_python_type)


class TemplateInstantiator:
    """Creates workflow definitions from templates."""

    def __init__(self, parameter_validator: TemplateParameterValidator):
        """Initialize with parameter validator."""
        self.parameter_validator = parameter_validator

    async def instantiate_template(
        self,
        template: WorkflowTemplate,
        parameters: dict[str, Any],
        workflow_id: str | None = None,
    ) -> WorkflowDefinition:
        """
        Create a workflow definition from a template.

        Args:
            template: Template to instantiate
            parameters: Parameters for template instantiation
            workflow_id: Optional custom workflow ID

        Returns:
            Instantiated workflow definition
        """
        # Validate parameters
        validated_params = self.parameter_validator.validate_parameters(template, parameters)

        # Generate workflow ID if not provided
        if not workflow_id:
            workflow_id = f"{template.template_id}_{uuid4().hex[:8]}"

        # Create base workflow definition
        workflow_def = WorkflowDefinition(
            workflow_id=workflow_id,
            name=self._substitute_parameters(template.name, validated_params),
            description=self._substitute_parameters(template.description, validated_params),
            version="1.0.0",
            workflow_type=WorkflowType.TASK,  # Default, could be parameterized
            required_agents=list(template.agent_configuration_template.keys()),
            steps=[],
            success_criteria={"template_instantiated": True},
            created_by=f"template:{template.template_id}",
        )

        # Instantiate workflow steps
        workflow_def.steps = await self._instantiate_steps(
            template.step_templates, validated_params
        )

        # Set agent configuration
        workflow_def.agent_config = template.agent_configuration_template

        # Instantiate global validation gates
        workflow_def.global_validation_gates = await self._instantiate_validation_gates(
            template.validation_gate_templates, validated_params
        )

        # Update template usage statistics
        await self._update_template_usage(template)

        logger.info(
            "Instantiated template '%s' as workflow '%s'",
            template.template_id,
            workflow_id,
        )

        return workflow_def

    async def _instantiate_steps(
        self,
        step_templates: list[dict[str, Any]],
        parameters: dict[str, Any],
    ) -> list[WorkflowStep]:
        """Instantiate workflow steps from templates."""
        steps = []

        for step_template in step_templates:
            # Substitute parameters in step template
            instantiated_step_data = self._substitute_parameters_recursive(
                step_template, parameters
            )

            # Create WorkflowStep object
            try:
                # Convert dependencies
                dependencies = []
                for dep_data in instantiated_step_data.get("dependencies", []):
                    dependencies.append(TaskDependency(**dep_data))

                # Convert validation gates
                validation_gates = []
                for gate_data in instantiated_step_data.get("validation_gates", []):
                    validation_gates.append(ValidationGate(**gate_data))

                step = WorkflowStep(
                    step_id=instantiated_step_data["step_id"],
                    name=instantiated_step_data["name"],
                    description=instantiated_step_data["description"],
                    agent_role=AgentRole(instantiated_step_data["agent_role"]),
                    action_type=instantiated_step_data["action_type"],
                    action_details=instantiated_step_data.get("action_details", {}),
                    dependencies=dependencies,
                    parallel_group=instantiated_step_data.get("parallel_group"),
                    timeout_minutes=instantiated_step_data.get("timeout_minutes", 60),
                    validation_gates=validation_gates,
                    tdd_required=instantiated_step_data.get("tdd_required", True),
                    input_context=instantiated_step_data.get("input_context", {}),
                    expected_outputs=instantiated_step_data.get("expected_outputs", []),
                    success_criteria=instantiated_step_data.get("success_criteria", {}),
                )

                steps.append(step)

            except Exception as e:
                logger.error("Failed to instantiate step from template: %s", e)
                raise ValueError(f"Step instantiation failed: {e}")

        return steps

    async def _instantiate_validation_gates(
        self,
        gate_templates: list[dict[str, Any]],
        parameters: dict[str, Any],
    ) -> list[ValidationGate]:
        """Instantiate validation gates from templates."""
        gates = []

        for gate_template in gate_templates:
            instantiated_gate_data = self._substitute_parameters_recursive(
                gate_template, parameters
            )

            try:
                gate = ValidationGate(
                    name=instantiated_gate_data["name"],
                    description=instantiated_gate_data["description"],
                    agent_role=AgentRole(instantiated_gate_data["agent_role"]),
                    validation_command=instantiated_gate_data["validation_command"],
                    success_criteria=instantiated_gate_data["success_criteria"],
                    failure_action=instantiated_gate_data.get("failure_action", "block"),
                    retry_count=instantiated_gate_data.get("retry_count", 3),
                )

                gates.append(gate)

            except Exception as e:
                logger.error("Failed to instantiate validation gate from template: %s", e)
                raise ValueError(f"Validation gate instantiation failed: {e}")

        return gates

    def _substitute_parameters(self, text: str, parameters: dict[str, Any]) -> str:
        """Substitute template parameters in text using ${param} syntax."""
        if not isinstance(text, str):
            return text

        result = text
        for param_name, param_value in parameters.items():
            placeholder = f"${{{param_name}}}"
            result = result.replace(placeholder, str(param_value))

        return result

    def _substitute_parameters_recursive(
        self, data: Any, parameters: dict[str, Any]
    ) -> Any:
        """Recursively substitute parameters in nested data structures."""
        if isinstance(data, str):
            return self._substitute_parameters(data, parameters)
        elif isinstance(data, dict):
            return {
                key: self._substitute_parameters_recursive(value, parameters)
                for key, value in data.items()
            }
        elif isinstance(data, list):
            return [
                self._substitute_parameters_recursive(item, parameters)
                for item in data
            ]
        else:
            return data

    async def _update_template_usage(self, template: WorkflowTemplate) -> None:
        """Update template usage statistics."""
        template.usage_count += 1
        template.last_used = datetime.now()
        # In real implementation, would persist to database


class WorkflowTemplateManager:
    """
    Main manager for workflow templates.

    Handles template CRUD operations, inheritance resolution,
    versioning, and instantiation.
    """

    def __init__(self, templates_dir: Path = None):
        """Initialize template manager."""
        self.templates_dir = templates_dir or Path("templates")
        self.templates: dict[str, WorkflowTemplate] = {}
        self.versions: dict[str, list[WorkflowVersion]] = {}
        self.inheritance_resolver = TemplateInheritanceResolver(self)
        self.parameter_validator = TemplateParameterValidator()
        self.instantiator = TemplateInstantiator(self.parameter_validator)

    async def load_templates(self) -> None:
        """Load all templates from the templates directory."""
        if not self.templates_dir.exists():
            logger.warning("Templates directory does not exist: %s", self.templates_dir)
            return

        template_files = list(self.templates_dir.rglob("*.yml")) + list(
            self.templates_dir.rglob("*.yaml")
        )

        loaded_count = 0
        for template_file in template_files:
            try:
                await self._load_single_template(template_file)
                loaded_count += 1
            except Exception as e:
                logger.error("Failed to load template from %s: %s", template_file, e)

        logger.info("Loaded %d workflow templates", loaded_count)

    async def _load_single_template(self, template_file: Path) -> None:
        """Load a single template file."""
        with open(template_file, encoding="utf-8") as f:
            template_data = yaml.safe_load(f)

        template = WorkflowTemplate(**template_data)
        self.templates[template.template_id] = template

        logger.debug("Loaded template: %s", template.template_id)

    async def save_template(self, template: WorkflowTemplate) -> None:
        """Save a template to storage."""
        self.templates[template.template_id] = template

        # Save to file system
        template_file = self.templates_dir / f"{template.template_id}.yml"
        template_file.parent.mkdir(parents=True, exist_ok=True)

        with open(template_file, "w", encoding="utf-8") as f:
            yaml.dump(template.model_dump(), f, default_flow_style=False)

        logger.info("Saved template: %s", template.template_id)

    async def get_template(self, template_id: str) -> WorkflowTemplate | None:
        """Get a template by ID."""
        return self.templates.get(template_id)

    async def create_template_from_workflow(
        self,
        workflow_def: WorkflowDefinition,
        template_name: str,
        template_description: str,
        parameterizable_fields: list[str],
        created_by: str,
    ) -> WorkflowTemplate:
        """
        Create a reusable template from an existing workflow.

        Args:
            workflow_def: Workflow definition to convert
            template_name: Name for the new template
            template_description: Description for the template
            parameterizable_fields: Fields that should become parameters
            created_by: Template creator

        Returns:
            Created workflow template
        """
        template_id = f"template_{uuid4().hex[:8]}"

        # Convert workflow steps to step templates
        step_templates = []
        for step in workflow_def.steps:
            step_template = self._convert_step_to_template(step, parameterizable_fields)
            step_templates.append(step_template)

        # Convert validation gates to templates
        validation_gate_templates = []
        for gate in workflow_def.global_validation_gates:
            gate_template = self._convert_validation_gate_to_template(gate, parameterizable_fields)
            validation_gate_templates.append(gate_template)

        # Generate parameters from parameterizable fields
        required_parameters, optional_parameters, parameter_validation = (
            self._generate_parameters_from_fields(workflow_def, parameterizable_fields)
        )

        template = WorkflowTemplate(
            template_id=template_id,
            name=template_name,
            description=template_description,
            template_category="generated",
            step_templates=step_templates,
            agent_configuration_template=workflow_def.agent_config,
            validation_gate_templates=validation_gate_templates,
            required_parameters=required_parameters,
            optional_parameters=optional_parameters,
            parameter_validation=parameter_validation,
            created_by=created_by,
        )

        await self.save_template(template)
        return template

    async def instantiate_template(
        self,
        template_id: str,
        parameters: dict[str, Any],
        workflow_id: str | None = None,
    ) -> WorkflowDefinition:
        """
        Instantiate a workflow from a template.

        Args:
            template_id: ID of template to instantiate
            parameters: Parameters for instantiation
            workflow_id: Optional custom workflow ID

        Returns:
            Instantiated workflow definition
        """
        template = await self.get_template(template_id)
        if not template:
            raise ValueError(f"Template not found: {template_id}")

        # Resolve inheritance
        resolved_template = await self.inheritance_resolver.resolve_template_inheritance(template)

        # Instantiate the resolved template
        return await self.instantiator.instantiate_template(
            resolved_template, parameters, workflow_id
        )

    async def create_template_version(
        self,
        template_id: str,
        version_number: str,
        changes: list[str],
        change_type: str = "minor",
    ) -> WorkflowVersion:
        """Create a new version of an existing template."""
        template = await self.get_template(template_id)
        if not template:
            raise ValueError(f"Template not found: {template_id}")

        version = WorkflowVersion(
            version_id=f"{template_id}_{version_number}",
            workflow_id=template_id,
            version_number=version_number,
            changes=changes,
            change_type=change_type,
            workflow_snapshot=template.model_copy(deep=True),
            created_by="system",
            release_notes=f"Version {version_number} - {change_type} update",
        )

        if template_id not in self.versions:
            self.versions[template_id] = []

        self.versions[template_id].append(version)
        return version

    async def list_templates(
        self,
        category: str | None = None,
        tags: list[str] | None = None,
    ) -> list[WorkflowTemplate]:
        """List templates with optional filtering."""
        templates = list(self.templates.values())

        if category:
            templates = [t for t in templates if t.template_category == category]

        if tags:
            templates = [
                t for t in templates
                if any(tag in t.tags for tag in tags)
            ]

        return sorted(templates, key=lambda x: x.usage_count, reverse=True)

    async def get_template_analytics(self) -> dict[str, Any]:
        """Get analytics about template usage."""
        total_templates = len(self.templates)
        total_usage = sum(t.usage_count for t in self.templates.values())

        # Group by category
        categories = {}
        for template in self.templates.values():
            category = template.template_category
            if category not in categories:
                categories[category] = {"count": 0, "usage": 0}
            categories[category]["count"] += 1
            categories[category]["usage"] += template.usage_count

        # Most used templates
        most_used = sorted(
            self.templates.values(),
            key=lambda x: x.usage_count,
            reverse=True,
        )[:10]

        return {
            "total_templates": total_templates,
            "total_instantiations": total_usage,
            "average_usage_per_template": total_usage / total_templates if total_templates > 0 else 0,
            "categories": categories,
            "most_used_templates": [
                {
                    "template_id": t.template_id,
                    "name": t.name,
                    "usage_count": t.usage_count,
                    "success_rate": t.success_rate,
                }
                for t in most_used
            ],
        }

    def _convert_step_to_template(
        self, step: WorkflowStep, parameterizable_fields: list[str]
    ) -> dict[str, Any]:
        """Convert a workflow step to a step template."""
        step_data = step.model_dump()

        # Replace parameterizable fields with placeholders
        for field in parameterizable_fields:
            if field in step_data:
                value = step_data[field]
                if isinstance(value, str):
                    step_data[field] = f"${{{field}}}"

        return step_data

    def _convert_validation_gate_to_template(
        self, gate: ValidationGate, parameterizable_fields: list[str]
    ) -> dict[str, Any]:
        """Convert a validation gate to a template."""
        gate_data = gate.model_dump()

        # Replace parameterizable fields with placeholders
        for field in parameterizable_fields:
            if field in gate_data:
                value = gate_data[field]
                if isinstance(value, str):
                    gate_data[field] = f"${{{field}}}"

        return gate_data

    def _generate_parameters_from_fields(
        self, workflow_def: WorkflowDefinition, parameterizable_fields: list[str]
    ) -> tuple[list[str], dict[str, Any], dict[str, Any]]:
        """Generate parameter definitions from parameterizable fields."""
        required_parameters = []
        optional_parameters = {}
        parameter_validation = {}

        for field in parameterizable_fields:
            # Simple heuristics for parameter types
            if "name" in field.lower() or "description" in field.lower():
                parameter_validation[field] = {"type": "string", "min_length": 1}
                required_parameters.append(field)
            elif "timeout" in field.lower():
                parameter_validation[field] = {"type": "integer", "min": 1, "max": 1440}
                optional_parameters[field] = 60
            elif "count" in field.lower():
                parameter_validation[field] = {"type": "integer", "min": 1}
                optional_parameters[field] = 1
            else:
                parameter_validation[field] = {"type": "string"}
                optional_parameters[field] = ""

        return required_parameters, optional_parameters, parameter_validation
