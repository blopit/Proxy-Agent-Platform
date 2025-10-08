"""
Examples demonstrating the Enhanced Workflow System capabilities.

This module provides comprehensive examples of how to use the advanced
workflow features including monitoring, adaptation, orchestration, and templates.
"""

import asyncio
import logging
from pathlib import Path

from .engine import EnhancedWorkflowEngine
from .schema import (
    AgentRole,
    WorkflowDefinition,
    WorkflowStep,
    WorkflowType,
)
from .utils import WorkflowEngineConfig

logger = logging.getLogger(__name__)


async def example_basic_enhanced_workflow():
    """Example of basic enhanced workflow execution."""
    print("=== Basic Enhanced Workflow Example ===")

    # Create enhanced workflow engine with all features enabled
    config = WorkflowEngineConfig(
        workflows_dir=Path("./example_workflows"),
        templates_dir=Path("./example_templates"),
        enable_monitoring=True,
        enable_adaptation=True,
        enable_orchestration=True,
    )

    engine = EnhancedWorkflowEngine(
        workflows_dir=config.workflows_dir,
        templates_dir=config.templates_dir,
        enable_monitoring=config.enable_monitoring,
        enable_adaptation=config.enable_adaptation,
        enable_orchestration=config.enable_orchestration,
    )

    try:
        # Start the engine (initializes all components)
        await engine.start()

        # Check engine status
        status = engine.get_engine_status()
        print(f"Engine Status: {status}")

        # Create a simple workflow definition
        workflow_def = WorkflowDefinition(
            workflow_id="example_basic_workflow",
            name="Basic Example Workflow",
            description="A simple workflow to demonstrate enhanced capabilities",
            workflow_type=WorkflowType.TASK,
            required_agents=[AgentRole.ARCHITECT, AgentRole.IMPLEMENTATION],
            steps=[
                WorkflowStep(
                    step_id="design_phase",
                    name="Design System Architecture",
                    description="Create system design and architecture",
                    agent_role=AgentRole.ARCHITECT,
                    action_type="plan",
                    action_details={"complexity": "medium"},
                    success_criteria={"design_complete": True},
                ),
                WorkflowStep(
                    step_id="implementation_phase",
                    name="Implement Code",
                    description="Implement the designed system",
                    agent_role=AgentRole.IMPLEMENTATION,
                    action_type="implement",
                    action_details={"tdd_required": True},
                    success_criteria={"implementation_complete": True},
                ),
            ],
            success_criteria={"workflow_complete": True},
            created_by="example_system",
        )

        # Add workflow to engine
        engine.workflow_definitions[workflow_def.workflow_id] = workflow_def

        # Execute the workflow with enhanced features
        result = await engine.execute_workflow(
            workflow_def.workflow_id,
            context={"project_name": "example_project"},
            enable_adaptation=True,
        )

        print(f"Workflow Result: {result.status}")
        print(f"Duration: {result.duration_seconds:.2f} seconds")
        print(f"Completed Steps: {len(result.completed_steps)}")

        # Get real-time analytics
        analytics = await engine.get_workflow_analytics(workflow_def.workflow_id)
        if analytics:
            print(f"Analytics - Success Rate: {analytics.successful_executions}/{analytics.total_executions}")

        # Get orchestration status
        orchestration_status = await engine.get_agent_orchestration_status()
        if orchestration_status:
            print(f"Agent Health: {orchestration_status['health_monitoring']}")

    except Exception as e:
        logger.error(f"Example failed: {e}")
    finally:
        # Graceful shutdown
        await engine.shutdown()


async def example_template_based_workflow():
    """Example of template-based workflow creation and execution."""
    print("\n=== Template-Based Workflow Example ===")

    engine = EnhancedWorkflowEngine()

    try:
        await engine.start()

        # Create a workflow template programmatically
        template_data = {
            "template_id": "feature_development_template",
            "name": "Feature Development Template",
            "description": "Template for developing new features with TDD",
            "template_category": "development",
            "step_templates": [
                {
                    "step_id": "analyze_requirements",
                    "name": "Analyze Requirements for ${feature_name}",
                    "description": "Analyze requirements for ${feature_name} with complexity ${complexity}",
                    "agent_role": "architect",
                    "action_type": "plan",
                    "action_details": {"complexity": "${complexity}"},
                    "timeout_minutes": "${timeout_minutes}",
                    "dependencies": [],
                    "validation_gates": [],
                    "success_criteria": {"analysis_complete": True},
                },
                {
                    "step_id": "implement_feature",
                    "name": "Implement ${feature_name}",
                    "description": "TDD implementation of ${feature_name}",
                    "agent_role": "implementation",
                    "action_type": "implement",
                    "action_details": {"tdd_required": True, "feature_type": "${feature_type}"},
                    "timeout_minutes": "${implementation_timeout}",
                    "dependencies": [{"task_id": "analyze_requirements", "dependency_type": "requires"}],
                    "validation_gates": [],
                    "success_criteria": {"implementation_complete": True},
                },
            ],
            "required_parameters": ["feature_name", "complexity"],
            "optional_parameters": {
                "feature_type": "standard",
                "timeout_minutes": 30,
                "implementation_timeout": 60,
            },
            "parameter_validation": {
                "feature_name": {"type": "string", "min_length": 3},
                "complexity": {"type": "string", "allowed_values": ["low", "medium", "high"]},
                "timeout_minutes": {"type": "integer", "min": 5, "max": 120},
            },
            "created_by": "example_system",
        }

        # Save the template
        from .schema import WorkflowTemplate
        template = WorkflowTemplate(**template_data)
        await engine.template_manager.save_template(template)

        # List available templates
        templates = await engine.list_available_templates()
        print(f"Available Templates: {len(templates)}")

        # Execute workflow from template
        result = await engine.execute_workflow_from_template(
            template_id="feature_development_template",
            parameters={
                "feature_name": "user_authentication",
                "complexity": "medium",
                "feature_type": "security",
                "timeout_minutes": 45,
            },
        )

        print(f"Template-based Workflow Result: {result.status}")

        # Get template analytics
        template_analytics = await engine.get_template_analytics()
        print(f"Template Analytics: {template_analytics}")

    except Exception as e:
        logger.error(f"Template example failed: {e}")
    finally:
        await engine.shutdown()


async def example_monitoring_and_analytics():
    """Example of real-time monitoring and analytics."""
    print("\n=== Monitoring and Analytics Example ===")

    engine = EnhancedWorkflowEngine(enable_monitoring=True)

    try:
        await engine.start()

        # Execute multiple workflows to generate data
        workflow_def = WorkflowDefinition(
            workflow_id="monitoring_test_workflow",
            name="Monitoring Test Workflow",
            description="Workflow to demonstrate monitoring capabilities",
            workflow_type=WorkflowType.TASK,
            required_agents=[AgentRole.IMPLEMENTATION, AgentRole.QUALITY],
            steps=[
                WorkflowStep(
                    step_id="implement_code",
                    name="Implement Code",
                    description="Implement test code",
                    agent_role=AgentRole.IMPLEMENTATION,
                    action_type="implement",
                    action_details={},
                    success_criteria={"code_implemented": True},
                ),
                WorkflowStep(
                    step_id="test_code",
                    name="Test Code",
                    description="Test the implemented code",
                    agent_role=AgentRole.QUALITY,
                    action_type="test",
                    action_details={},
                    success_criteria={"tests_passed": True},
                ),
            ],
            success_criteria={"workflow_complete": True},
            created_by="monitoring_example",
        )

        engine.workflow_definitions[workflow_def.workflow_id] = workflow_def

        # Execute workflow multiple times
        for i in range(3):
            print(f"Executing workflow iteration {i+1}")
            result = await engine.execute_workflow(workflow_def.workflow_id)

        # Get real-time dashboard data
        dashboard_data = await engine.get_real_time_dashboard_data()
        if dashboard_data:
            print(f"Active Workflows: {dashboard_data['active_workflows']}")
            print(f"Success Rate: {dashboard_data['success_rate_percent']:.1f}%")
            print(f"Average Duration: {dashboard_data['average_duration_seconds']:.2f}s")

        # Get workflow analytics
        analytics = await engine.get_workflow_analytics(workflow_def.workflow_id)
        if analytics:
            print(f"Total Executions: {analytics.total_executions}")
            print(f"Performance Trend: {analytics.performance_trend}")
            print(f"Efficiency Score: {analytics.efficiency_score:.1f}")

        # Get optimization suggestions
        suggestions = await engine.suggest_workflow_optimizations(workflow_def.workflow_id)
        if suggestions:
            print(f"Optimization Suggestions: {len(suggestions)}")
            for suggestion in suggestions:
                print(f"  - {suggestion['type']}: {suggestion['description']}")

    except Exception as e:
        logger.error(f"Monitoring example failed: {e}")
    finally:
        await engine.shutdown()


async def example_agent_orchestration():
    """Example of advanced agent orchestration with load balancing."""
    print("\n=== Agent Orchestration Example ===")

    engine = EnhancedWorkflowEngine(enable_orchestration=True)

    try:
        await engine.start()

        # Get orchestration status
        status = await engine.get_agent_orchestration_status()
        if status:
            print("Orchestration Status:")
            print(f"  Load Balancing: {status['load_balancing']}")
            print(f"  Agent Pools: {len(status['agent_pools'])}")

        # Create a workflow that will exercise the orchestration system
        workflow_def = WorkflowDefinition(
            workflow_id="orchestration_test_workflow",
            name="Orchestration Test Workflow",
            description="Workflow to test agent orchestration",
            workflow_type=WorkflowType.TASK,
            required_agents=[AgentRole.ARCHITECT, AgentRole.IMPLEMENTATION, AgentRole.QUALITY],
            steps=[
                WorkflowStep(
                    step_id="parallel_design_1",
                    name="Design Component A",
                    description="Design first component",
                    agent_role=AgentRole.ARCHITECT,
                    action_type="plan",
                    action_details={},
                    parallel_group="design_phase",
                    success_criteria={"design_complete": True},
                ),
                WorkflowStep(
                    step_id="parallel_design_2",
                    name="Design Component B",
                    description="Design second component",
                    agent_role=AgentRole.ARCHITECT,
                    action_type="plan",
                    action_details={},
                    parallel_group="design_phase",
                    success_criteria={"design_complete": True},
                ),
                WorkflowStep(
                    step_id="implementation",
                    name="Implement System",
                    description="Implement the designed system",
                    agent_role=AgentRole.IMPLEMENTATION,
                    action_type="implement",
                    action_details={},
                    success_criteria={"implementation_complete": True},
                ),
                WorkflowStep(
                    step_id="quality_check",
                    name="Quality Assurance",
                    description="Quality check of implementation",
                    agent_role=AgentRole.QUALITY,
                    action_type="test",
                    action_details={},
                    success_criteria={"quality_verified": True},
                ),
            ],
            success_criteria={"workflow_complete": True},
            created_by="orchestration_example",
        )

        engine.workflow_definitions[workflow_def.workflow_id] = workflow_def

        # Execute the workflow
        result = await engine.execute_workflow(workflow_def.workflow_id)
        print(f"Orchestration Test Result: {result.status}")

        # Get final orchestration status
        final_status = await engine.get_agent_orchestration_status()
        if final_status:
            print("Final Agent Health:")
            health = final_status.get("health_monitoring", {})
            print(f"  Healthy Agents: {health.get('healthy', 0)}")
            print(f"  Total Agents: {health.get('total', 0)}")

    except Exception as e:
        logger.error(f"Orchestration example failed: {e}")
    finally:
        await engine.shutdown()


async def example_workflow_adaptation():
    """Example of dynamic workflow adaptation."""
    print("\n=== Workflow Adaptation Example ===")

    engine = EnhancedWorkflowEngine(enable_adaptation=True)

    try:
        await engine.start()

        # Create a workflow that might trigger adaptations
        workflow_def = WorkflowDefinition(
            workflow_id="adaptation_test_workflow",
            name="Adaptation Test Workflow",
            description="Workflow to test dynamic adaptation",
            workflow_type=WorkflowType.TASK,
            required_agents=[AgentRole.IMPLEMENTATION, AgentRole.QUALITY],
            steps=[
                WorkflowStep(
                    step_id="complex_implementation",
                    name="Complex Implementation",
                    description="Implementation that might fail or be slow",
                    agent_role=AgentRole.IMPLEMENTATION,
                    action_type="implement",
                    action_details={"complexity": "high", "timeout_minutes": 5},  # Short timeout
                    success_criteria={"implementation_complete": True},
                ),
                WorkflowStep(
                    step_id="thorough_testing",
                    name="Thorough Testing",
                    description="Comprehensive testing with potential for retries",
                    agent_role=AgentRole.QUALITY,
                    action_type="test",
                    action_details={"test_coverage": 95},
                    success_criteria={"tests_passed": True},
                ),
            ],
            success_criteria={"workflow_complete": True},
            created_by="adaptation_example",
        )

        engine.workflow_definitions[workflow_def.workflow_id] = workflow_def

        # Execute with adaptation enabled
        result = await engine.execute_workflow(
            workflow_def.workflow_id,
            enable_adaptation=True
        )

        print(f"Adaptation Test Result: {result.status}")

        # Check if any adaptations were applied
        if hasattr(engine.adaptation_engine, 'adaptation_history'):
            adaptations = engine.adaptation_engine.adaptation_history
            if adaptations:
                print(f"Adaptations Applied: {len(adaptations)}")
                for adaptation in adaptations:
                    print(f"  - {adaptation.trigger}: {adaptation.description}")

    except Exception as e:
        logger.error(f"Adaptation example failed: {e}")
    finally:
        await engine.shutdown()


async def run_all_examples():
    """Run all workflow system examples."""
    print("Starting Enhanced Workflow System Examples")
    print("=" * 50)

    examples = [
        example_basic_enhanced_workflow,
        example_template_based_workflow,
        example_monitoring_and_analytics,
        example_agent_orchestration,
        example_workflow_adaptation,
    ]

    for example in examples:
        try:
            await example()
        except Exception as e:
            logger.error(f"Example {example.__name__} failed: {e}")

        # Small delay between examples
        await asyncio.sleep(1)

    print("\n" + "=" * 50)
    print("All examples completed!")


if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    # Run examples
    asyncio.run(run_all_examples())
