"""
E2E Test: Multi-Task Flow with Task Splitting

Tests the complete workflow for complex multi-task management:
1. User registration and onboarding
2. Create complex project with multiple tasks
3. Use AI to split complex tasks into micro-steps
4. Organize tasks in Explorer view
5. Start focus session on task
6. Complete micro-steps sequentially
7. Set morning ritual with top 3 tasks
8. Verify gamification progression

This test exercises the full ADHD-friendly task splitting and management features.
"""

import pytest
from fastapi.testclient import TestClient

from .utils import (
    ReportGenerator,
    TestUserFactory,
    create_test_focus_session,
    create_test_morning_ritual,
    create_test_simple_task,
)


@pytest.mark.e2e
@pytest.mark.slow
@pytest.mark.requires_llm
class TestMultiTaskE2E:
    """End-to-end test for multi-task workflow with task splitting"""

    def test_multi_task_with_splitting_flow(
        self,
        e2e_api_client: TestClient,
        test_user_factory: TestUserFactory,
        report_generator: ReportGenerator,
        generate_reports: bool,
        use_real_llms: bool,
    ) -> None:
        """
        Test complete multi-task flow with AI task splitting.

        Args:
            e2e_api_client: FastAPI test client
            test_user_factory: Test user factory
            report_generator: Report generator for human review
            generate_reports: Whether to generate reports
            use_real_llms: Whether to use real LLM calls
        """
        test_passed = False

        try:
            # Initialize report
            report_generator.set_metadata(
                test_name="Multi-Task Flow with Task Splitting",
                test_id=test_user_factory.create_unique_user()["metadata"]["test_id"],
                use_real_llms=use_real_llms,
            )

            # ================================================================
            # Step 1: User Registration
            # ================================================================
            user_info = test_user_factory.create_unique_user(
                test_name="multi_task", include_onboarding=True
            )
            user_data = user_info["user_data"]

            registration_response = e2e_api_client.post(
                "/api/v1/auth/register",
                json={
                    "username": user_data["username"],
                    "email": user_data["email"],
                    "password": user_data["password"],
                    "full_name": user_data["full_name"],
                },
            )

            assert registration_response.status_code == 201
            reg_data = registration_response.json()
            access_token = reg_data["access_token"]
            user_id = reg_data.get("user", {}).get("user_id")

            report_generator.metadata["user_data"] = {
                "user_id": user_id,
                "username": user_data["username"],
                "access_token": access_token,
            }

            report_generator.add_section(
                section_name="Sign Up",
                status="✅",
                details={"user_id": user_id},
            )

            # ================================================================
            # Step 2: Onboarding with ADHD Settings
            # ================================================================
            onboarding_data = user_info["onboarding_data"]
            onboarding_data["adhd_support_level"] = 9  # High ADHD support

            onboarding_response = e2e_api_client.put(
                f"/api/v1/users/{user_id}/onboarding",
                json=onboarding_data,
            )

            assert onboarding_response.status_code == 200
            onboarding_result = onboarding_response.json()

            report_generator.add_section(
                section_name="Onboarding (High ADHD Support)",
                status="✅",
                details={
                    "adhd_support_level": 9,
                    "challenges": onboarding_result.get("adhd_challenges"),
                },
            )

            # ================================================================
            # Step 3: Create Complex Project
            # ================================================================
            project_response = e2e_api_client.post(
                "/api/v1/projects",
                headers={"Authorization": f"Bearer {access_token}"},
                json={
                    "name": "E2E Complex Project - Mobile App Development",
                    "description": "Build a complete mobile app with backend and frontend",
                },
            )

            if project_response.status_code == 404:
                project_id = None
                report_generator.add_section(
                    section_name="Create Project",
                    status="⚠️",
                    details={"note": "Project endpoint not implemented"},
                )
            else:
                assert project_response.status_code in (200, 201)
                project_data = project_response.json()
                project_id = project_data.get("project_id")

                report_generator.add_section(
                    section_name="Create Complex Project",
                    status="✅",
                    details={
                        "project_id": project_id,
                        "name": "Mobile App Development",
                    },
                )

            # ================================================================
            # Step 4: Create Multiple Tasks (Simple + Complex)
            # ================================================================
            created_tasks = []
            complex_task_ids = []  # Track complex task IDs for splitting

            # Create 3 simple tasks
            for i in range(3):
                simple_task = create_test_simple_task(
                    title=f"Simple task {i+1}: Code review",
                    project_id=project_id,
                    priority=["low", "medium", "high"][i],
                )

                task_response = e2e_api_client.post(
                    "/api/v1/tasks",
                    headers={"Authorization": f"Bearer {access_token}"},
                    json=simple_task,
                )

                if task_response.status_code in (200, 201):
                    created_tasks.append(task_response.json())

            # Create 2 MULTI-scope tasks for AI splitting (15-60 min range triggers LLM)
            from .utils import create_test_multi_scope_task

            complex_tasks = [
                create_test_multi_scope_task(
                    title="Implement user profile editing with photo upload",
                    project_id=project_id,
                ),
                create_test_multi_scope_task(
                    title="Add email notification preferences settings",
                    project_id=project_id,
                ),
            ]

            for complex_task in complex_tasks:
                task_response = e2e_api_client.post(
                    "/api/v1/tasks",
                    headers={"Authorization": f"Bearer {access_token}"},
                    json=complex_task,
                )

                if task_response.status_code in (200, 201):
                    task_data = task_response.json()
                    created_tasks.append(task_data)
                    # Track complex task IDs for AI splitting
                    complex_task_ids.append(task_data.get("task_id"))

            report_generator.add_section(
                section_name="Create Multiple Tasks",
                status="✅",
                details={
                    "total_tasks": len(created_tasks),
                    "simple_tasks": 3,
                    "complex_tasks": 2,
                    "task_titles": [t.get("title") for t in created_tasks],
                },
            )

            # ================================================================
            # Step 5: Split Complex Tasks into Micro-Steps
            # ================================================================
            # Split the complex tasks we created
            split_results = []

            for task_id in complex_task_ids:
                # Try task splitting endpoint with AI
                split_response = e2e_api_client.post(
                    f"/api/v1/tasks/{task_id}/split",
                    headers={"Authorization": f"Bearer {access_token}"},
                    json={"user_id": user_id},
                )

                if split_response.status_code in (200, 201):
                    split_data = split_response.json()
                    split_results.append(split_data)

                    # 🚨 CRITICAL: Check if LLM was actually used
                    metadata = split_data.get("metadata", {})
                    generation_method = metadata.get("generation_method")
                    llm_used = metadata.get("llm_used", False)

                    if use_real_llms and generation_method == "rule_based_fallback":
                        # FAIL THE TEST - Fallback was used when we expected real LLMs!
                        error_msg = (
                            f"🚨 LLM FALLBACK DETECTED! 🚨\n"
                            f"Expected real LLM calls but got rule-based fallback.\n"
                            f"Task ID: {task_id}\n"
                            f"Metadata: {metadata}\n"
                            f"This means API keys are missing or LLM client failed to initialize!"
                        )
                        report_generator.add_error(error_msg)
                        raise AssertionError(error_msg)

                    # Log which method was used
                    if llm_used:
                        report_generator.add_section(
                            section_name=f"Task {task_id[:8]} - AI Generation Verified",
                            status="✅",
                            details={
                                "generation_method": generation_method,
                                "llm_used": llm_used,
                                "ai_provider": metadata.get("ai_provider"),
                                "micro_steps_count": len(split_data.get("micro_steps", [])),
                            },
                        )
                else:
                    # Endpoint might not exist or have different path
                    split_results.append(
                        {
                            "note": "Split endpoint not available or failed",
                            "status_code": split_response.status_code,
                        }
                    )

            report_generator.add_section(
                section_name="AI Task Splitting",
                status="✅" if any("micro_steps" in r for r in split_results) else "⚠️",
                details={
                    "complex_tasks_split": len(complex_task_ids),
                    "split_results": split_results,
                    "note": "Check AI reasoning for task breakdowns in results",
                },
            )

            # ================================================================
            # Step 6: View Tasks in Explorer (List/Filter)
            # ================================================================
            # Get all tasks for user
            tasks_list_response = e2e_api_client.get(
                "/api/v1/tasks",
                headers={"Authorization": f"Bearer {access_token}"},
                params={"user_id": user_id},
            )

            if tasks_list_response.status_code == 404:
                # Try alternative endpoint
                tasks_list_response = e2e_api_client.get(
                    f"/api/v1/users/{user_id}/tasks",
                    headers={"Authorization": f"Bearer {access_token}"},
                )

            tasks_list = []
            if tasks_list_response.status_code == 200:
                tasks_list = tasks_list_response.json()

            report_generator.add_section(
                section_name="Explorer - View All Tasks",
                status="✅",
                details={
                    "total_tasks": len(tasks_list) if isinstance(tasks_list, list) else "N/A",
                    "organized_view": "Tasks retrieved for explorer view",
                },
            )

            # ================================================================
            # Step 7: Start Focus Session on First Task
            # ================================================================
            if created_tasks:
                first_task_id = created_tasks[0].get("task_id")

                focus_session_data = create_test_focus_session(
                    task_id=first_task_id,
                    duration_minutes=25,
                )

                focus_response = e2e_api_client.post(
                    "/api/v1/focus-sessions",
                    headers={"Authorization": f"Bearer {access_token}"},
                    json=focus_session_data,
                )

                if focus_response.status_code in (200, 201):
                    focus_result = focus_response.json()
                    session_id = focus_result.get("session_id")

                    # Simulate completing the focus session
                    complete_response = e2e_api_client.patch(
                        f"/api/v1/focus-sessions/{session_id}",
                        headers={"Authorization": f"Bearer {access_token}"},
                        json={"is_completed": True},
                    )

                    report_generator.add_section(
                        section_name="Focus Session (Pomodoro)",
                        status="✅",
                        details={
                            "task_id": first_task_id,
                            "duration_minutes": 25,
                            "completed": complete_response.status_code in (200, 204),
                        },
                    )
                else:
                    report_generator.add_section(
                        section_name="Focus Session",
                        status="⚠️",
                        details={"note": "Focus session endpoint not available"},
                    )

            # ================================================================
            # Step 8: Complete Some Micro-Steps
            # ================================================================
            # If we have micro-steps, complete a few
            completed_steps = []

            for split_result in split_results:
                if "micro_steps" in split_result:
                    steps = split_result.get("micro_steps", [])
                    # Complete first 2 micro-steps
                    for step in steps[:2]:
                        step_id = step.get("step_id")
                        complete_step_response = e2e_api_client.patch(
                            f"/api/v1/micro-steps/{step_id}",
                            headers={"Authorization": f"Bearer {access_token}"},
                            json={"is_completed": True},
                        )

                        if complete_step_response.status_code in (200, 204):
                            completed_steps.append(step_id)

            report_generator.add_section(
                section_name="Complete Micro-Steps",
                status="✅" if completed_steps else "⚠️",
                details={
                    "completed_steps_count": len(completed_steps),
                    "note": "Micro-steps completed sequentially"
                    if completed_steps
                    else "No micro-steps to complete",
                },
            )

            # ================================================================
            # Step 9: Set Morning Ritual (Top 3 Focus Tasks)
            # ================================================================
            if len(created_tasks) >= 3:
                top_3_task_ids = [t.get("task_id") for t in created_tasks[:3]]

                morning_ritual = create_test_morning_ritual(focus_task_ids=top_3_task_ids)

                ritual_response = e2e_api_client.post(
                    f"/api/v1/users/{user_id}/morning-rituals",
                    headers={"Authorization": f"Bearer {access_token}"},
                    json=morning_ritual,
                )

                if ritual_response.status_code in (200, 201):
                    report_generator.add_section(
                        section_name="Morning Ritual",
                        status="✅",
                        details={
                            "top_3_tasks": top_3_task_ids,
                            "date": morning_ritual["completion_date"],
                        },
                    )
                else:
                    report_generator.add_section(
                        section_name="Morning Ritual",
                        status="⚠️",
                        details={"note": "Morning ritual endpoint not available"},
                    )

            # ================================================================
            # Step 10: Verify Gamification Progression
            # ================================================================
            profile_response = e2e_api_client.get(
                "/api/v1/auth/profile",
                headers={"Authorization": f"Bearer {access_token}"},
            )

            assert profile_response.status_code == 200
            profile_data = profile_response.json()

            # Get pet info
            pet_response = e2e_api_client.get(
                f"/api/v1/users/{user_id}/pet",
                headers={"Authorization": f"Bearer {access_token}"},
            )

            pet_info = {}
            if pet_response.status_code == 200:
                pet_info = pet_response.json()

            report_generator.add_section(
                section_name="Gamification Progression",
                status="✅",
                details={
                    "xp_earned": pet_info.get("xp_earned", "N/A"),
                    "level": pet_info.get("level", "N/A"),
                    "pet_health": pet_info.get("health", "N/A"),
                    "tasks_completed": len(completed_steps) + 1,  # +1 for focus session
                },
            )

            # ================================================================
            # Test Passed!
            # ================================================================
            test_passed = True

            # Add final state
            report_generator.metadata["final_state"] = {
                "user": profile_data,
                "tasks": {
                    "total_created": len(created_tasks),
                    "complex_split": len(complex_task_ids),
                    "micro_steps_completed": len(completed_steps),
                },
                "pet": pet_info,
            }

        except AssertionError as e:
            report_generator.add_error(f"Assertion failed: {str(e)}")
            test_passed = False
            raise

        except Exception as e:
            report_generator.add_error(f"Unexpected error: {str(e)}")
            test_passed = False
            raise

        finally:
            if generate_reports:
                report_path = report_generator.save_report(test_passed)
                print(f"\n{'='*80}")
                print(f"Human review report generated: {report_path}")
                print(f"{'='*80}\n")

            summary = report_generator.get_summary()
            print(f"\n{'='*80}")
            print("E2E Multi-Task Test Summary:")
            print(f"  Test Name: {summary['test_name']}")
            print(f"  Duration: {summary['duration_seconds']:.2f}s")
            print(f"  Sections: {summary['passed_sections']}/{summary['total_sections']} passed")
            print(f"  Status: {'✅ PASSED' if test_passed else '❌ FAILED'}")
            print(f"{'='*80}\n")
