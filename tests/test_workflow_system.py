"""
Comprehensive tests for the AI Agent Workflow System.

Tests the hierarchical workflow engine, agent collaboration, and
inter-agent communication protocol using TDD methodology.
"""

import asyncio
from uuid import uuid4

import pytest
import yaml

from proxy_agent_platform.workflows import (
    AgentRole,
    ValidationGate,
    WorkflowContext,
    WorkflowDefinition,
    WorkflowEngine,
    WorkflowStatus,
    WorkflowStep,
    WorkflowType,
)
from proxy_agent_platform.workflows.communication import (
    AgentMessage,
    CommunicationBus,
    MessageType,
    TaskAssignment,
)


class TestWorkflowDefinitionSchema:
    """Test workflow definition schema and validation."""

    def test_workflow_definition_creation(self):
        """Test creating a valid workflow definition."""
        # Test data
        validation_gate = ValidationGate(
            name="test_gate",
            description="Test validation gate",
            agent_role=AgentRole.QUALITY,
            validation_command="test_command",
            success_criteria={"test": True},
        )

        workflow_step = WorkflowStep(
            step_id="test_step",
            name="Test Step",
            description="Test step description",
            agent_role=AgentRole.IMPLEMENTATION,
            action_type="implement",
            action_details={"test": "details"},
            success_criteria={"completed": True},
            validation_gates=[validation_gate],
        )

        workflow_def = WorkflowDefinition(
            workflow_id="test_workflow",
            name="Test Workflow",
            description="Test workflow description",
            workflow_type=WorkflowType.TASK,
            required_agents=[AgentRole.IMPLEMENTATION, AgentRole.QUALITY],
            steps=[workflow_step],
            success_criteria={"workflow_completed": True},
            created_by="test_system",
        )

        # Assertions
        assert workflow_def.workflow_id == "test_workflow"
        assert workflow_def.workflow_type == WorkflowType.TASK
        assert len(workflow_def.steps) == 1
        assert len(workflow_def.required_agents) == 2
        assert AgentRole.IMPLEMENTATION in workflow_def.required_agents

    def test_workflow_step_validation_gates(self):
        """Test workflow step with multiple validation gates."""
        validation_gates = [
            ValidationGate(
                name="code_quality",
                description="Code quality validation",
                agent_role=AgentRole.QUALITY,
                validation_command="check_code_quality",
                success_criteria={"quality_score": 8.0},
            ),
            ValidationGate(
                name="test_coverage",
                description="Test coverage validation",
                agent_role=AgentRole.QUALITY,
                validation_command="check_coverage",
                success_criteria={"coverage": 95.0},
            ),
        ]

        step = WorkflowStep(
            step_id="quality_step",
            name="Quality Validation Step",
            description="Step with multiple validation gates",
            agent_role=AgentRole.QUALITY,
            action_type="test",
            action_details={"test_type": "comprehensive"},
            success_criteria={"all_validations_passed": True},
            validation_gates=validation_gates,
        )

        assert len(step.validation_gates) == 2
        assert step.validation_gates[0].name == "code_quality"
        assert step.validation_gates[1].name == "test_coverage"

    def test_workflow_definition_dependencies(self):
        """Test workflow definition with dependencies."""
        from proxy_agent_platform.workflows.schema import TaskDependency

        dependency = TaskDependency(task_id="prerequisite_task", dependency_type="requires")

        workflow_def = WorkflowDefinition(
            workflow_id="dependent_workflow",
            name="Dependent Workflow",
            description="Workflow with dependencies",
            workflow_type=WorkflowType.PHASE,
            required_agents=[AgentRole.PROJECT_MANAGER],
            steps=[],
            success_criteria={"completed": True},
            dependencies=[dependency],
            created_by="test_system",
        )

        assert len(workflow_def.dependencies) == 1
        assert workflow_def.dependencies[0].task_id == "prerequisite_task"


class TestWorkflowEngine:
    """Test the workflow execution engine."""

    @pytest.fixture
    def workflow_engine(self, tmp_path):
        """Create a workflow engine with temporary workflows directory."""
        workflows_dir = tmp_path / "workflows"
        workflows_dir.mkdir()
        return WorkflowEngine(workflows_dir)

    @pytest.fixture
    def sample_workflow_definition(self):
        """Create a sample workflow definition for testing."""
        step = WorkflowStep(
            step_id="test_step_1",
            name="Test Implementation Step",
            description="Test step for workflow execution",
            agent_role=AgentRole.IMPLEMENTATION,
            action_type="implement",
            action_details={"feature": "test_feature"},
            success_criteria={"implemented": True},
        )

        return WorkflowDefinition(
            workflow_id="test_execution_workflow",
            name="Test Execution Workflow",
            description="Workflow for testing execution",
            workflow_type=WorkflowType.TASK,
            required_agents=[AgentRole.IMPLEMENTATION],
            steps=[step],
            success_criteria={"workflow_completed": True},
            created_by="test_system",
        )

    def test_workflow_engine_initialization(self, workflow_engine):
        """Test workflow engine initialization."""
        assert workflow_engine is not None
        assert len(workflow_engine.agent_pool) == 5  # 5 specialized agents
        assert AgentRole.PROJECT_MANAGER in workflow_engine.agent_pool
        assert AgentRole.ARCHITECT in workflow_engine.agent_pool
        assert AgentRole.IMPLEMENTATION in workflow_engine.agent_pool
        assert AgentRole.QUALITY in workflow_engine.agent_pool
        assert AgentRole.INTEGRATION in workflow_engine.agent_pool

    def test_workflow_definition_loading(self, tmp_path):
        """Test loading workflow definitions from YAML files."""
        workflows_dir = tmp_path / "workflows"
        workflows_dir.mkdir()

        # Create a test workflow YAML file
        test_workflow = {
            "workflow_id": "test_yaml_workflow",
            "name": "Test YAML Workflow",
            "description": "Workflow loaded from YAML",
            "workflow_type": "task",
            "required_agents": ["implementation"],
            "steps": [
                {
                    "step_id": "yaml_step",
                    "name": "YAML Step",
                    "description": "Step from YAML",
                    "agent_role": "implementation",
                    "action_type": "implement",
                    "action_details": {"test": True},
                    "success_criteria": {"completed": True},
                }
            ],
            "success_criteria": {"yaml_loaded": True},
            "created_by": "test",
        }

        yaml_file = workflows_dir / "test_workflow.yml"
        with open(yaml_file, "w") as f:
            yaml.dump(test_workflow, f)

        # Initialize engine and test loading
        engine = WorkflowEngine(workflows_dir)
        assert "test_yaml_workflow" in engine.workflow_definitions
        loaded_workflow = engine.workflow_definitions["test_yaml_workflow"]
        assert loaded_workflow.name == "Test YAML Workflow"

    def test_dependency_resolution(self, workflow_engine, sample_workflow_definition):
        """Test workflow dependency resolution."""
        # Add the workflow to engine
        workflow_engine.workflow_definitions["test_execution_workflow"] = sample_workflow_definition

        # Test dependency resolution
        execution_plan = asyncio.run(
            workflow_engine._resolve_dependencies(sample_workflow_definition)
        )

        assert "step_order" in execution_plan
        assert "dependencies" in execution_plan
        assert "total_steps" in execution_plan
        assert execution_plan["total_steps"] == 1
        assert "test_step_1" in execution_plan["step_order"]

    @pytest.mark.asyncio
    async def test_workflow_execution_success(self, workflow_engine, sample_workflow_definition):
        """Test successful workflow execution."""
        # Add workflow to engine
        workflow_engine.workflow_definitions["test_execution_workflow"] = sample_workflow_definition

        # Execute workflow
        result = await workflow_engine.execute_workflow("test_execution_workflow")

        # Assertions
        assert result.workflow_id == "test_execution_workflow"
        assert result.status == WorkflowStatus.COMPLETED
        assert result.duration_seconds is not None
        assert result.duration_seconds > 0
        assert len(result.completed_steps) > 0

    def test_workflow_status_tracking(self, workflow_engine):
        """Test workflow status tracking during execution."""
        execution_id = uuid4()
        context = WorkflowContext(workflow_id=execution_id)

        # Add to active workflows
        workflow_engine.active_workflows[execution_id] = context

        # Test status retrieval
        status = workflow_engine.get_workflow_status(execution_id)
        assert status is not None
        assert status.workflow_id == execution_id

    def test_available_workflows_listing(self, workflow_engine, sample_workflow_definition):
        """Test listing available workflow definitions."""
        workflow_engine.workflow_definitions["test_workflow"] = sample_workflow_definition

        workflows = workflow_engine.list_available_workflows()
        assert len(workflows) >= 1

        test_workflow = next((wf for wf in workflows if wf["workflow_id"] == "test_workflow"), None)
        assert test_workflow is not None
        assert test_workflow["name"] == "Test Execution Workflow"
        assert test_workflow["type"] == WorkflowType.TASK


class TestCommunicationBus:
    """Test inter-agent communication system."""

    @pytest.fixture
    def communication_bus(self):
        """Create a communication bus for testing."""
        return CommunicationBus()

    @pytest.fixture
    def sample_message(self):
        """Create a sample agent message."""
        return AgentMessage(
            message_type=MessageType.TASK_ASSIGNMENT,
            sender_agent="project_manager",
            recipient_agent="implementation",
            workflow_id=uuid4(),
            subject="Test Task Assignment",
            content={"task": "test_implementation"},
        )

    def test_communication_bus_initialization(self, communication_bus):
        """Test communication bus initialization."""
        assert communication_bus is not None
        assert len(communication_bus.message_queue) == 0
        assert len(communication_bus.message_history) == 0
        assert len(communication_bus.agent_subscriptions) == 0

    def test_agent_subscription(self, communication_bus):
        """Test agent subscription to message types."""
        message_types = [MessageType.TASK_ASSIGNMENT, MessageType.VALIDATION_REQUEST]
        communication_bus.subscribe_agent("implementation", message_types)

        assert "implementation" in communication_bus.agent_subscriptions
        assert communication_bus.agent_subscriptions["implementation"] == message_types

    def test_message_sending(self, communication_bus, sample_message):
        """Test sending messages through communication bus."""
        result = communication_bus.send_message(sample_message)

        assert result is True
        assert len(communication_bus.message_queue) == 1
        assert sample_message.workflow_id in communication_bus.active_conversations

    def test_message_delivery(self, communication_bus, sample_message):
        """Test message delivery to specific agents."""
        # Subscribe agent to message type
        communication_bus.subscribe_agent("implementation", [MessageType.TASK_ASSIGNMENT])

        # Send message
        communication_bus.send_message(sample_message)

        # Deliver messages
        messages = communication_bus.deliver_messages("implementation")

        assert len(messages) == 1
        assert messages[0].message_id == sample_message.message_id
        assert len(communication_bus.message_queue) == 0  # Message moved to history

    def test_message_acknowledgment(self, communication_bus, sample_message):
        """Test message acknowledgment."""
        communication_bus.subscribe_agent("implementation", [MessageType.TASK_ASSIGNMENT])
        communication_bus.send_message(sample_message)
        messages = communication_bus.deliver_messages("implementation")

        # Acknowledge message
        result = communication_bus.acknowledge_message(messages[0].message_id, "implementation")

        assert result is True
        # Find message in history and check acknowledgment
        acknowledged_message = next(
            (
                msg
                for msg in communication_bus.message_history
                if msg.message_id == messages[0].message_id
            ),
            None,
        )
        assert acknowledged_message is not None
        assert acknowledged_message.acknowledged is True

    def test_task_assignment_message_creation(self, communication_bus):
        """Test creating task assignment messages."""
        workflow_id = uuid4()
        task_assignment = TaskAssignment(
            task_id="test_task",
            task_name="Test Task",
            task_description="Test task description",
            assigned_agent="implementation",
            requirements={"coding": True},
            expected_outputs=["code", "tests"],
            acceptance_criteria={"tests_pass": True},
        )

        message = communication_bus.create_task_assignment_message(
            workflow_id=workflow_id,
            assignment=task_assignment,
            sender="project_manager",
            recipient="implementation",
        )

        assert message.message_type == MessageType.TASK_ASSIGNMENT
        assert message.sender_agent == "project_manager"
        assert message.recipient_agent == "implementation"
        assert message.workflow_id == workflow_id
        assert "Test Task" in message.subject

    def test_conversation_history(self, communication_bus):
        """Test conversation history tracking."""
        workflow_id = uuid4()
        message1 = AgentMessage(
            message_type=MessageType.TASK_ASSIGNMENT,
            sender_agent="project_manager",
            recipient_agent="implementation",
            workflow_id=workflow_id,
            subject="First Message",
            content={"task": "first"},
        )
        message2 = AgentMessage(
            message_type=MessageType.TASK_COMPLETION,
            sender_agent="implementation",
            recipient_agent="project_manager",
            workflow_id=workflow_id,
            subject="Task Complete",
            content={"status": "completed"},
        )

        # Send messages
        communication_bus.send_message(message1)
        communication_bus.send_message(message2)

        # Move to history by delivering
        communication_bus.subscribe_agent("implementation", [MessageType.TASK_ASSIGNMENT])
        communication_bus.subscribe_agent("project_manager", [MessageType.TASK_COMPLETION])
        communication_bus.deliver_messages("implementation")
        communication_bus.deliver_messages("project_manager")

        # Test conversation history
        history = communication_bus.get_conversation_history(workflow_id)
        assert len(history) == 2
        assert any(msg.subject == "First Message" for msg in history)
        assert any(msg.subject == "Task Complete" for msg in history)


class TestAgentCollaboration:
    """Test agent collaboration scenarios."""

    @pytest.fixture
    def collaborative_workflow(self):
        """Create a workflow that requires agent collaboration."""
        steps = [
            WorkflowStep(
                step_id="design_step",
                name="Design System",
                description="Architect designs the system",
                agent_role=AgentRole.ARCHITECT,
                action_type="plan",
                action_details={"design_type": "system_architecture"},
                success_criteria={"design_completed": True},
            ),
            WorkflowStep(
                step_id="implement_step",
                name="Implement System",
                description="Implementation agent builds the system",
                agent_role=AgentRole.IMPLEMENTATION,
                action_type="implement",
                action_details={"implementation_type": "tdd"},
                dependencies=[{"task_id": "design_step", "dependency_type": "requires"}],
                success_criteria={"implementation_completed": True},
            ),
            WorkflowStep(
                step_id="validate_step",
                name="Validate Implementation",
                description="Quality agent validates the implementation",
                agent_role=AgentRole.QUALITY,
                action_type="test",
                action_details={"validation_type": "comprehensive"},
                dependencies=[{"task_id": "implement_step", "dependency_type": "requires"}],
                success_criteria={"validation_passed": True},
            ),
        ]

        return WorkflowDefinition(
            workflow_id="collaborative_workflow",
            name="Collaborative Workflow",
            description="Workflow requiring agent collaboration",
            workflow_type=WorkflowType.PHASE,
            required_agents=[AgentRole.ARCHITECT, AgentRole.IMPLEMENTATION, AgentRole.QUALITY],
            steps=steps,
            success_criteria={"all_steps_completed": True},
            created_by="test_system",
        )

    @pytest.mark.asyncio
    async def test_multi_agent_workflow_execution(self, tmp_path, collaborative_workflow):
        """Test execution of workflow requiring multiple agents."""
        engine = WorkflowEngine(tmp_path / "workflows")
        engine.workflow_definitions["collaborative_workflow"] = collaborative_workflow

        # Test dependency resolution
        execution_plan = await engine._resolve_dependencies(collaborative_workflow)

        # Verify execution order respects dependencies
        step_order = execution_plan["step_order"]
        design_index = step_order.index("design_step")
        implement_index = step_order.index("implement_step")
        validate_index = step_order.index("validate_step")

        assert design_index < implement_index < validate_index

    def test_agent_handoff_scenario(self):
        """Test agent handoff during workflow execution."""
        from proxy_agent_platform.workflows.communication import AgentHandoff

        handoff = AgentHandoff(
            from_agent="architect",
            to_agent="implementation",
            handoff_reason="design_phase_complete",
            current_state={"design": "completed"},
            completed_work=["system_design", "api_specification"],
            remaining_work=["implementation", "testing"],
            context_data={"design_patterns": ["mvc", "repository"]},
            working_files=["design.md", "api_spec.yml"],
        )

        assert handoff.from_agent == "architect"
        assert handoff.to_agent == "implementation"
        assert len(handoff.completed_work) == 2
        assert len(handoff.remaining_work) == 2
        assert "design_patterns" in handoff.context_data


class TestTDDWorkflowIntegration:
    """Test TDD (Test-Driven Development) integration in workflows."""

    def test_tdd_workflow_step_creation(self):
        """Test creating workflow steps that enforce TDD."""
        tdd_step = WorkflowStep(
            step_id="tdd_implementation",
            name="TDD Implementation Step",
            description="Implement feature using TDD methodology",
            agent_role=AgentRole.IMPLEMENTATION,
            action_type="implement",
            action_details={"tdd_phases": ["red", "green", "refactor"], "test_first": True},
            tdd_required=True,
            success_criteria={
                "tests_written_first": True,
                "implementation_passes_tests": True,
                "code_refactored": True,
            },
        )

        assert tdd_step.tdd_required is True
        assert tdd_step.action_details["test_first"] is True
        assert "red" in tdd_step.action_details["tdd_phases"]

    def test_validation_gate_for_tdd(self):
        """Test validation gates that enforce TDD practices."""
        tdd_validation = ValidationGate(
            name="tdd_compliance_check",
            description="Validate TDD methodology was followed",
            agent_role=AgentRole.QUALITY,
            validation_command="validate_tdd_compliance",
            success_criteria={
                "test_written_first": True,
                "test_coverage": 95.0,
                "refactoring_performed": True,
            },
        )

        assert tdd_validation.name == "tdd_compliance_check"
        assert tdd_validation.success_criteria["test_coverage"] == 95.0


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
