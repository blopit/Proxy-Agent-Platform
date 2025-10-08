#!/usr/bin/env python3
"""
Demonstration of the Hierarchical AI Agent Workflow System.

This script shows how to use the workflow system to systematically
complete project tasks through AI agent collaboration.
"""

import asyncio
import logging
from pathlib import Path

from proxy_agent_platform.workflows import WorkflowEngine

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


async def demonstrate_workflow_system():
    """
    Demonstrate the complete workflow system capabilities.

    Shows how any AI agent can be pointed to a workflow and
    systematically complete complex tasks.
    """
    logger.info("🚀 Starting Hierarchical AI Agent Workflow System Demo")

    # Initialize the workflow engine
    workflows_dir = Path(__file__).parent.parent  # workflows/ directory
    engine = WorkflowEngine(workflows_dir)

    logger.info("✅ Workflow engine initialized")
    logger.info(f"📁 Workflows directory: {workflows_dir}")
    logger.info(f"🤖 Available agents: {list(engine.agent_pool.keys())}")

    # List available workflows
    available_workflows = engine.list_available_workflows()
    logger.info(f"📋 Available workflows: {len(available_workflows)}")

    for workflow in available_workflows:
        logger.info(f"   - {workflow['workflow_id']}: {workflow['name']} ({workflow['type']})")

    # Demonstrate executing the critical security workflow
    logger.info("\n🔒 Demonstrating Critical Security Workflow Execution")
    logger.info("This would fix the CORS vulnerability and other security issues")

    try:
        if "critical_security_audit" in engine.workflow_definitions:
            logger.info("Executing critical security audit workflow...")

            # In a real scenario, this would execute the full workflow
            # For demo purposes, we'll simulate the execution
            security_workflow = engine.workflow_definitions["critical_security_audit"]
            logger.info(f"   📊 Workflow has {len(security_workflow.steps)} steps")
            logger.info(f"   🎯 Required agents: {security_workflow.required_agents}")
            logger.info(f"   ⏱️ Estimated time: {security_workflow.timeout_hours} hours")

            # Simulate dependency resolution
            execution_plan = await engine._resolve_dependencies(security_workflow)
            logger.info(f"   📈 Execution plan created with {execution_plan['total_steps']} steps")
            logger.info(f"   🔗 Step execution order: {execution_plan['step_order']}")

    except Exception as e:
        logger.error(f"Error demonstrating security workflow: {e}")

    # Demonstrate the meta-workflow capability
    logger.info("\n🎯 Demonstrating Meta-Workflow Capability")
    logger.info("This shows how to complete the ENTIRE project systematically")

    try:
        if "meta_complete_project" in engine.workflow_definitions:
            logger.info("Meta-workflow for complete project found!")

            meta_workflow = engine.workflow_definitions["meta_complete_project"]
            logger.info(
                f"   🏗️ This workflow orchestrates all {len(meta_workflow.steps)} major phases"
            )
            logger.info(f"   📅 Estimated total time: {meta_workflow.timeout_hours} hours")
            logger.info(f"   🎪 Success criteria: {list(meta_workflow.success_criteria.keys())}")

            # Show the hierarchical structure
            logger.info("   📊 Hierarchical execution plan:")
            for i, step in enumerate(meta_workflow.steps, 1):
                logger.info(f"      {i}. {step.name} ({step.agent_role})")
                if step.dependencies:
                    deps = [dep.task_id for dep in step.dependencies]
                    logger.info(f"         ↳ Depends on: {deps}")

    except Exception as e:
        logger.error(f"Error demonstrating meta-workflow: {e}")

    # Show how to use the system
    logger.info("\n📖 How to Use This System:")
    logger.info("""
    1. Point any AI agent to a workflow:
       > ai-agent execute workflows/meta/complete-project.yml

    2. Execute specific epic:
       > ai-agent execute workflows/epic/epic-1-core-agents.yml

    3. Fix critical issues:
       > ai-agent execute workflows/critical/security-audit.yml

    4. Run individual tasks:
       > ai-agent execute workflows/task/tdd-implementation.yml --task-id T1.1.1
    """)

    logger.info("\n🎯 Key Benefits:")
    logger.info("   ✅ Any AI agent can complete the entire project")
    logger.info("   ✅ Hierarchical delegation (Meta → Epic → Phase → Task)")
    logger.info("   ✅ Intelligent dependency resolution")
    logger.info("   ✅ TDD methodology enforced throughout")
    logger.info("   ✅ Quality gates and validation at every step")
    logger.info("   ✅ Human checkpoints at strategic points")
    logger.info("   ✅ Real-time progress tracking")

    logger.info("\n🏁 Demo completed successfully!")
    logger.info("The hierarchical workflow system is ready for production use.")


async def demonstrate_agent_collaboration():
    """Demonstrate how agents collaborate on complex tasks."""
    logger.info("\n🤝 Demonstrating Agent Collaboration")

    from proxy_agent_platform.workflows.communication import (
        CommunicationBus,
        MessageType,
        TaskAssignment,
    )

    # Create communication bus
    comm_bus = CommunicationBus()

    # Subscribe agents to message types
    comm_bus.subscribe_agent(
        "project_manager", [MessageType.TASK_COMPLETION, MessageType.VALIDATION_RESULT]
    )
    comm_bus.subscribe_agent(
        "implementation", [MessageType.TASK_ASSIGNMENT, MessageType.VALIDATION_REQUEST]
    )
    comm_bus.subscribe_agent(
        "quality", [MessageType.VALIDATION_REQUEST, MessageType.TASK_COMPLETION]
    )

    # Create a sample task assignment
    task = TaskAssignment(
        task_id="demo_task",
        task_name="Implement User Authentication",
        task_description="Implement secure user authentication with JWT tokens",
        assigned_agent="implementation",
        requirements={"security": "JWT tokens", "framework": "FastAPI", "testing": "95% coverage"},
        expected_outputs=["auth_endpoints", "jwt_middleware", "security_tests"],
        acceptance_criteria={
            "endpoints_functional": True,
            "security_validated": True,
            "tests_passing": True,
        },
    )

    # Create and send task assignment message
    from uuid import uuid4

    workflow_id = uuid4()

    assignment_message = comm_bus.create_task_assignment_message(
        workflow_id=workflow_id,
        assignment=task,
        sender="project_manager",
        recipient="implementation",
    )

    comm_bus.send_message(assignment_message)
    logger.info("📤 Project Manager sent task assignment to Implementation Agent")

    # Deliver messages to implementation agent
    messages = comm_bus.deliver_messages("implementation")
    logger.info(f"📥 Implementation Agent received {len(messages)} messages")

    for message in messages:
        logger.info(f"   📝 {message.subject}")
        comm_bus.acknowledge_message(message.message_id, "implementation")

    logger.info("✅ Agent collaboration demonstration completed")


def run_demo():
    """Run the complete demonstration."""
    print("🤖 Hierarchical AI Agent Workflow System Demo")
    print("=" * 50)

    try:
        # Run the async demonstration
        asyncio.run(demonstrate_workflow_system())
        asyncio.run(demonstrate_agent_collaboration())

    except KeyboardInterrupt:
        print("\n⏹️ Demo interrupted by user")
    except Exception as e:
        print(f"\n❌ Demo failed with error: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    run_demo()
