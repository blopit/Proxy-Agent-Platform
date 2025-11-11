#!/usr/bin/env python3
"""
Mobile-Backend Integration Test

Tests the complete onboarding API flow that the mobile app will use.
This is an integration test that requires the backend server to be running.

Run with: uv run python tests/integration/test_onboarding_flow.py
"""

import json
from datetime import datetime

import requests

# Configuration
BASE_URL = "http://localhost:8000"
TEST_USER_ID = f"mobile_test_{int(datetime.now().timestamp())}"


def print_test(name: str):
    print(f"\n{'='*60}")
    print(f"TEST: {name}")
    print("=" * 60)


def print_result(success: bool, message: str, data=None):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")
    if data:
        print(f"Response: {json.dumps(data, indent=2)}")
    return success


def test_1_create_onboarding():
    """Test 1: Create initial onboarding data (simulates OB-02: Work Preferences)"""
    print_test("Create Onboarding - Work Preference")

    payload = {"work_preference": "remote"}

    response = requests.put(
        f"{BASE_URL}/api/v1/users/{TEST_USER_ID}/onboarding",
        json=payload,
        headers={"Content-Type": "application/json"},
    )

    if response.status_code == 200:
        data = response.json()
        success = (
            data["user_id"] == TEST_USER_ID
            and data["work_preference"] == "remote"
            and data["onboarding_completed"] is False
        )
        return print_result(success, "Created onboarding with work preference", data)
    else:
        return print_result(False, f"Failed with status {response.status_code}: {response.text}")


def test_2_get_onboarding():
    """Test 2: Retrieve onboarding data"""
    print_test("Get Onboarding Data")

    response = requests.get(f"{BASE_URL}/api/v1/users/{TEST_USER_ID}/onboarding")

    if response.status_code == 200:
        data = response.json()
        success = data["work_preference"] == "remote"
        return print_result(success, "Retrieved onboarding data", data)
    else:
        return print_result(False, f"Failed with status {response.status_code}: {response.text}")


def test_3_update_adhd_level():
    """Test 3: Update ADHD support level (simulates OB-03)"""
    print_test("Update ADHD Support Level")

    payload = {
        "adhd_support_level": 7,
        "adhd_challenges": ["time_blindness", "task_initiation", "focus"],
    }

    response = requests.put(
        f"{BASE_URL}/api/v1/users/{TEST_USER_ID}/onboarding",
        json=payload,
        headers={"Content-Type": "application/json"},
    )

    if response.status_code == 200:
        data = response.json()
        success = (
            data["adhd_support_level"] == 7
            and data["work_preference"] == "remote"  # Should preserve previous data
            and len(data["adhd_challenges"]) == 3
        )
        return print_result(success, "Updated ADHD level (upsert preserved work_preference)", data)
    else:
        return print_result(False, f"Failed with status {response.status_code}: {response.text}")


def test_4_update_schedule():
    """Test 4: Update daily schedule (simulates OB-04)"""
    print_test("Update Daily Schedule")

    payload = {
        "daily_schedule": {
            "time_preference": "morning",
            "flexible_enabled": False,
            "week_grid": {
                "monday": "8-17",
                "tuesday": "8-17",
                "wednesday": "flexible",
                "thursday": "8-17",
                "friday": "8-13",
                "saturday": "off",
                "sunday": "off",
            },
        }
    }

    response = requests.put(
        f"{BASE_URL}/api/v1/users/{TEST_USER_ID}/onboarding",
        json=payload,
        headers={"Content-Type": "application/json"},
    )

    if response.status_code == 200:
        data = response.json()
        success = (
            data["daily_schedule"] is not None
            and data["daily_schedule"]["time_preference"] == "morning"
            and data["adhd_support_level"] == 7  # Should preserve previous data
        )
        return print_result(success, "Updated daily schedule", data)
    else:
        return print_result(False, f"Failed with status {response.status_code}: {response.text}")


def test_5_update_goals():
    """Test 5: Update productivity goals (simulates OB-05)"""
    print_test("Update Productivity Goals")

    payload = {"productivity_goals": ["reduce_overwhelm", "increase_focus", "build_habits"]}

    response = requests.put(
        f"{BASE_URL}/api/v1/users/{TEST_USER_ID}/onboarding",
        json=payload,
        headers={"Content-Type": "application/json"},
    )

    if response.status_code == 200:
        data = response.json()
        success = (
            len(data["productivity_goals"]) == 3
            and "reduce_overwhelm" in data["productivity_goals"]
        )
        return print_result(success, "Updated productivity goals", data)
    else:
        return print_result(False, f"Failed with status {response.status_code}: {response.text}")


def test_6_mark_complete():
    """Test 6: Mark onboarding as completed (simulates OB-07: Complete)"""
    print_test("Mark Onboarding Complete")

    payload = {"completed": True}

    response = requests.post(
        f"{BASE_URL}/api/v1/users/{TEST_USER_ID}/onboarding/complete",
        json=payload,
        headers={"Content-Type": "application/json"},
    )

    if response.status_code == 200:
        data = response.json()
        success = (
            data["onboarding_completed"] is True
            and data["onboarding_skipped"] is False
            and data["completed_at"] is not None
        )
        return print_result(success, "Marked onboarding complete", data)
    else:
        return print_result(False, f"Failed with status {response.status_code}: {response.text}")


def test_7_verify_complete_data():
    """Test 7: Verify all data is present after completion"""
    print_test("Verify Complete Onboarding Data")

    response = requests.get(f"{BASE_URL}/api/v1/users/{TEST_USER_ID}/onboarding")

    if response.status_code == 200:
        data = response.json()
        success = (
            data["work_preference"] == "remote"
            and data["adhd_support_level"] == 7
            and len(data["adhd_challenges"]) == 3
            and data["daily_schedule"] is not None
            and len(data["productivity_goals"]) == 3
            and data["onboarding_completed"] is True
        )

        if success:
            print_result(True, "All onboarding data preserved correctly")
            print("\n📊 Final Onboarding Data:")
            print(f"  Work Preference: {data['work_preference']}")
            print(f"  ADHD Support: {data['adhd_support_level']}/10")
            print(f"  ADHD Challenges: {', '.join(data['adhd_challenges'])}")
            print(f"  Schedule Time: {data['daily_schedule']['time_preference']}")
            print(f"  Goals: {', '.join(data['productivity_goals'])}")
            print(f"  Completed: {data['completed_at']}")
        else:
            print_result(False, "Data integrity check failed", data)

        return success
    else:
        return print_result(False, f"Failed with status {response.status_code}: {response.text}")


def test_8_test_skip_flow():
    """Test 8: Test skip onboarding flow with new user"""
    print_test("Test Skip Onboarding Flow")

    skip_user_id = f"mobile_skip_test_{int(datetime.now().timestamp())}"

    payload = {"completed": False}  # False = skipped

    response = requests.post(
        f"{BASE_URL}/api/v1/users/{skip_user_id}/onboarding/complete",
        json=payload,
        headers={"Content-Type": "application/json"},
    )

    if response.status_code == 200:
        data = response.json()
        success = (
            data["onboarding_completed"] is False
            and data["onboarding_skipped"] is True
            and data["skipped_at"] is not None
        )
        return print_result(success, "Skip onboarding flow works correctly", data)
    else:
        return print_result(False, f"Failed with status {response.status_code}: {response.text}")


def test_9_delete_onboarding():
    """Test 9: Delete onboarding data (reset)"""
    print_test("Delete Onboarding Data")

    response = requests.delete(f"{BASE_URL}/api/v1/users/{TEST_USER_ID}/onboarding")

    if response.status_code == 204:
        # Verify deletion
        verify_response = requests.get(f"{BASE_URL}/api/v1/users/{TEST_USER_ID}/onboarding")
        success = verify_response.status_code == 404
        return print_result(success, "Deleted onboarding data successfully")
    else:
        return print_result(False, f"Failed with status {response.status_code}: {response.text}")


def main():
    print("=" * 60)
    print("🚀 MOBILE-BACKEND INTEGRATION TEST SUITE")
    print("=" * 60)
    print(f"Testing user: {TEST_USER_ID}")
    print(f"Backend URL: {BASE_URL}")

    results = []

    # Run all tests in sequence (they depend on each other)
    results.append(("Create onboarding", test_1_create_onboarding()))
    results.append(("Get onboarding", test_2_get_onboarding()))
    results.append(("Update ADHD level", test_3_update_adhd_level()))
    results.append(("Update schedule", test_4_update_schedule()))
    results.append(("Update goals", test_5_update_goals()))
    results.append(("Mark complete", test_6_mark_complete()))
    results.append(("Verify data", test_7_verify_complete_data()))
    results.append(("Test skip flow", test_8_test_skip_flow()))
    results.append(("Delete data", test_9_delete_onboarding()))

    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✅" if result else "❌"
        print(f"{status} {name}")

    print(f"\n{passed}/{total} tests passed ({passed/total*100:.1f}%)")

    if passed == total:
        print("\n🎉 ALL TESTS PASSED - Integration is working correctly!")
        print("\n✅ Mobile app is ready to connect to backend")
        print("✅ All CRUD operations verified")
        print("✅ Upsert pattern working (preserves previous data)")
        print("✅ Complete and skip flows validated")
        return 0
    else:
        print(f"\n❌ {total - passed} test(s) failed - Integration needs fixes")
        return 1


if __name__ == "__main__":
    exit(main())
