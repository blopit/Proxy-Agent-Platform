"""
E2E Test: Minimal Working Flow

Tests the basic workflow that we know works:
1. User registration
2. Onboarding
3. Profile verification

This test validates the core authentication and onboarding flow works end-to-end.
"""

import pytest
from fastapi.testclient import TestClient

from .utils import ReportGenerator, TestUserFactory


@pytest.mark.e2e
class TestMinimalE2E:
    """Minimal end-to-end test for core functionality"""

    def test_minimal_signup_and_onboarding_flow(
        self,
        e2e_api_client: TestClient,
        test_user_factory: TestUserFactory,
        report_generator: ReportGenerator,
        generate_reports: bool,
    ) -> None:
        """
        Test minimal flow: signup → onboarding → profile check.

        This test validates the core user lifecycle without depending on
        endpoints that may not be fully implemented yet.
        """
        test_passed = False

        try:
            # Initialize report
            report_generator.set_metadata(
                test_name="Minimal E2E Flow (Signup + Onboarding)",
                test_id=test_user_factory.create_unique_user()["metadata"]["test_id"],
            )

            # Step 1: User Registration
            user_info = test_user_factory.create_unique_user(
                test_name="minimal", include_onboarding=True
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
                "email": user_data["email"],
                "access_token": access_token,
            }

            report_generator.add_section(
                section_name="User Registration",
                status="✅",
                details={
                    "status_code": 201,
                    "user_id": user_id,
                    "username": user_data["username"],
                    "email": user_data["email"],
                },
            )

            # Step 2: Onboarding
            onboarding_data = user_info["onboarding_data"]

            onboarding_response = e2e_api_client.put(
                f"/api/v1/users/{user_id}/onboarding",
                json=onboarding_data,
            )

            assert onboarding_response.status_code == 200
            onboarding_result = onboarding_response.json()

            report_generator.add_section(
                section_name="Onboarding",
                status="✅",
                details={
                    "adhd_support_level": onboarding_result.get("adhd_support_level"),
                    "challenges": onboarding_result.get("adhd_challenges"),
                    "goals": onboarding_result.get("productivity_goals"),
                    "work_preference": onboarding_result.get("work_preference"),
                },
            )

            # Step 3: Verify Profile
            profile_response = e2e_api_client.get(
                "/api/v1/auth/profile",
                headers={"Authorization": f"Bearer {access_token}"},
            )

            assert profile_response.status_code == 200
            profile_data = profile_response.json()

            report_generator.add_section(
                section_name="Profile Verification",
                status="✅",
                details={
                    "username": profile_data.get("username"),
                    "email": profile_data.get("email"),
                    "full_name": profile_data.get("full_name"),
                    "is_active": profile_data.get("is_active"),
                    "timezone": profile_data.get("timezone"),
                },
            )

            # Step 4: Retrieve Onboarding Data
            get_onboarding_response = e2e_api_client.get(
                f"/api/v1/users/{user_id}/onboarding",
            )

            assert get_onboarding_response.status_code == 200
            retrieved_onboarding = get_onboarding_response.json()

            report_generator.add_section(
                section_name="Retrieve Onboarding Data",
                status="✅",
                details={
                    "onboarding_completed": retrieved_onboarding.get("onboarding_completed"),
                    "matches_submitted_data": (
                        retrieved_onboarding.get("adhd_support_level")
                        == onboarding_data["adhd_support_level"]
                    ),
                },
            )

            # Test passed!
            test_passed = True

            report_generator.metadata["final_state"] = {
                "user": profile_data,
                "onboarding": retrieved_onboarding,
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
                print(f"Human review report: {report_path}")
                print(f"{'='*80}\n")

            summary = report_generator.get_summary()
            print(f"\n{'='*80}")
            print("Minimal E2E Test Summary:")
            print(f"  Duration: {summary['duration_seconds']:.2f}s")
            print(f"  Sections: {summary['passed_sections']}/{summary['total_sections']} passed")
            print(f"  Status: {'✅ PASSED' if test_passed else '❌ FAILED'}")
            print(f"{'='*80}\n")
