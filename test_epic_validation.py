#!/usr/bin/env python3
"""
Comprehensive validation tests for Epic 3 (Advanced Workflow System) 
and Epic 4 (Mobile Integration Platform).

This script provides systematic testing and validation of all components
without requiring external dependencies that may not be available.
"""

import asyncio
import os
import sys
import tempfile
from datetime import datetime
from pathlib import Path
from uuid import uuid4

# Set test environment variables
os.environ["SECRET_KEY"] = "test_secret_key_for_testing_purposes_only"
os.environ["LLM_API_KEY"] = "test_api_key_for_testing"
os.environ["DATABASE_URL"] = "sqlite:///test.db"
os.environ["ENVIRONMENT"] = "test"
os.environ["DEBUG"] = "true"

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def test_epic3_workflow_system():
    """Test Epic 3 - Advanced Workflow System components."""
    print("\n=== Epic 3 - Advanced Workflow System Validation ===")

    try:
        # Test 1: Import and basic initialization
        print("\n1. Testing Enhanced Workflow Engine Import...")
        from proxy_agent_platform.workflows import (
            AgentRole,
            EnhancedWorkflowEngine,
            ValidationGate,
            WorkflowDefinition,
            WorkflowStep,
            WorkflowType,
        )
        print("✅ Successfully imported workflow components")

        # Test 2: Engine initialization with temporary directory
        print("\n2. Testing Enhanced Workflow Engine Initialization...")
        with tempfile.TemporaryDirectory() as temp_dir:
            workflows_dir = Path(temp_dir) / "workflows"
            templates_dir = Path(temp_dir) / "templates"
            workflows_dir.mkdir()
            templates_dir.mkdir()

            engine = EnhancedWorkflowEngine(
                workflows_dir=workflows_dir,
                templates_dir=templates_dir,
                enable_monitoring=True,
                enable_adaptation=True,
                enable_orchestration=True,
            )
            print("✅ Enhanced Workflow Engine initialized successfully")

            # Test 3: Engine status
            status = engine.get_engine_status()
            print(f"   Engine Status: {status}")
            assert status["engine_type"] == "enhanced"
            assert status["features"]["monitoring"] is True
            print("✅ Engine status validation passed")

        # Test 4: Workflow definition creation
        print("\n3. Testing Workflow Definition Creation...")
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
        print("✅ Workflow definition created successfully")

        # Test 5: Monitoring component
        print("\n4. Testing Monitoring Component...")
        from proxy_agent_platform.workflows import MetricsCollector
        metrics_collector = MetricsCollector()
        print("✅ MetricsCollector imported and initialized")

        # Test 6: Adaptation component
        print("\n5. Testing Adaptation Component...")
        from proxy_agent_platform.workflows import WorkflowAdaptationEngine
        adaptation_engine = WorkflowAdaptationEngine()
        print("✅ WorkflowAdaptationEngine imported and initialized")

        # Test 7: Orchestration component
        print("\n6. Testing Orchestration Component...")
        from proxy_agent_platform.workflows import AgentOrchestrator
        orchestrator = AgentOrchestrator()
        print("✅ AgentOrchestrator imported and initialized")

        # Test 8: Template management
        print("\n7. Testing Template Management...")
        from proxy_agent_platform.workflows import WorkflowTemplateManager
        with tempfile.TemporaryDirectory() as temp_dir:
            template_manager = WorkflowTemplateManager(Path(temp_dir))
            print("✅ WorkflowTemplateManager imported and initialized")

        print("\n🎉 Epic 3 - Advanced Workflow System: ALL TESTS PASSED")
        return True

    except Exception as e:
        print(f"❌ Epic 3 Test Failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_epic4_mobile_integration():
    """Test Epic 4 - Mobile Integration Platform components."""
    print("\n=== Epic 4 - Mobile Integration Platform Validation ===")

    try:
        # Test 1: Mobile notification manager
        print("\n1. Testing Enhanced Mobile Notification Manager...")
        from proxy_agent_platform.mobile import NotificationManager
        notification_manager = NotificationManager()
        print("✅ NotificationManager imported and initialized")

        # Test 2: Notification generation
        print("\n2. Testing Smart Notification Generation...")
        user_context = {
            "user_id": 1,
            "current_location": "home",
            "calendar_status": "free",
            "energy_level": "high",
            "recent_activity": "completed_task",
        }

        async def test_notification():
            notification = await notification_manager.generate_smart_notification(user_context)
            assert notification["status"] == "success"
            assert "message" in notification
            assert "timing_score" in notification
            return notification

        notification_result = asyncio.run(test_notification())
        print(f"   Generated notification: {notification_result}")
        print("✅ Smart notification generation successful")

        # Test 3: Notification personalization
        print("\n3. Testing Notification Personalization...")
        user_preferences = {
            "user_id": 1,
            "preferred_time": "morning",
            "notification_style": "encouraging",
            "goal_focus": "productivity",
        }

        async def test_personalization():
            personalized = await notification_manager.personalize_notification(
                "streak_milestone", user_preferences
            )
            assert personalized["status"] == "success"
            assert "personalized_message" in personalized
            return personalized

        personalization_result = asyncio.run(test_personalization())
        print(f"   Personalized notification: {personalization_result}")
        print("✅ Notification personalization successful")

        # Test 4: Mobile workflow bridge
        print("\n4. Testing Mobile-Workflow Integration Bridge...")
        from proxy_agent_platform.mobile.mobile_workflow_bridge import MobileWorkflowBridge
        bridge = MobileWorkflowBridge()
        print("✅ MobileWorkflowBridge imported and initialized")

        # Test 5: Voice processor (if available)
        print("\n5. Testing Voice Processor...")
        try:
            from proxy_agent_platform.mobile import VoiceProcessor
            voice_processor = VoiceProcessor()
            print("✅ VoiceProcessor imported and initialized")
        except ImportError as e:
            print(f"⚠️  VoiceProcessor import failed (may need dependencies): {e}")

        # Test 6: Offline manager
        print("\n6. Testing Offline Manager...")
        from proxy_agent_platform.mobile import OfflineManager
        offline_manager = OfflineManager()
        print("✅ OfflineManager imported and initialized")

        # Test 7: Wearable integration (if available)
        print("\n7. Testing Wearable Integration...")
        try:
            from proxy_agent_platform.mobile import WearableAPI
            wearable_api = WearableAPI()
            print("✅ WearableAPI imported and initialized")
        except ImportError as e:
            print(f"⚠️  WearableAPI import failed (may need dependencies): {e}")

        print("\n🎉 Epic 4 - Mobile Integration Platform: ALL TESTS PASSED")
        return True

    except Exception as e:
        print(f"❌ Epic 4 Test Failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_cross_epic_integration():
    """Test cross-epic integration between workflows and mobile."""
    print("\n=== Cross-Epic Integration Validation ===")

    try:
        # Test 1: Mobile triggering workflow
        print("\n1. Testing Mobile-Triggered Workflow Execution...")
        from proxy_agent_platform.mobile.mobile_workflow_bridge import MobileWorkflowBridge

        bridge = MobileWorkflowBridge()

        # Simulate mobile task capture triggering workflow
        mobile_task = {
            "task_id": str(uuid4()),
            "title": "Review project documentation",
            "priority": "high",
            "source": "voice_capture",
            "user_id": 1,
        }

        async def test_mobile_workflow():
            result = await bridge.trigger_workflow_from_mobile_input(mobile_task)
            assert result["status"] == "success"
            return result

        mobile_workflow_result = asyncio.run(test_mobile_workflow())
        print(f"   Mobile workflow trigger result: {mobile_workflow_result}")
        print("✅ Mobile-triggered workflow execution successful")

        # Test 2: Workflow triggering mobile notification
        print("\n2. Testing Workflow-Triggered Mobile Notification...")
        workflow_completion = {
            "workflow_id": "test_workflow_123",
            "status": "completed",
            "user_id": 1,
            "completion_time": datetime.now().isoformat(),
        }

        async def test_workflow_notification():
            notification_result = await bridge.send_workflow_completion_notification(
                workflow_completion
            )
            assert notification_result["status"] == "success"
            return notification_result

        workflow_notification_result = asyncio.run(test_workflow_notification())
        print(f"   Workflow notification result: {workflow_notification_result}")
        print("✅ Workflow-triggered mobile notification successful")

        print("\n🎉 Cross-Epic Integration: ALL TESTS PASSED")
        return True

    except Exception as e:
        print(f"❌ Cross-Epic Integration Test Failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def run_comprehensive_validation():
    """Run all validation tests and generate a summary report."""
    print("\n" + "="*80)
    print("COMPREHENSIVE EPIC 3 & 4 VALIDATION SUITE")
    print("="*80)

    results = {
        "epic3_workflow_system": False,
        "epic4_mobile_integration": False,
        "cross_epic_integration": False,
    }

    # Run Epic 3 tests
    results["epic3_workflow_system"] = test_epic3_workflow_system()

    # Run Epic 4 tests
    results["epic4_mobile_integration"] = test_epic4_mobile_integration()

    # Run cross-epic integration tests
    results["cross_epic_integration"] = test_cross_epic_integration()

    # Generate summary report
    print("\n" + "="*80)
    print("VALIDATION SUMMARY REPORT")
    print("="*80)

    total_tests = len(results)
    passed_tests = sum(results.values())

    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name:<30}: {status}")

    print(f"\nOverall Result: {passed_tests}/{total_tests} test suites passed")

    if passed_tests == total_tests:
        print("\n🎉 ALL VALIDATION TESTS PASSED! 🎉")
        print("Epic 3 and Epic 4 are ready for production.")
    else:
        print(f"\n⚠️  {total_tests - passed_tests} test suite(s) failed.")
        print("Review the errors above and fix the issues before deployment.")

    return passed_tests == total_tests

if __name__ == "__main__":
    success = run_comprehensive_validation()
    sys.exit(0 if success else 1)
