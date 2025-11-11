"""
Quick Integration Test for Onboarding API

A simpler, faster integration test for basic onboarding API validation.
This is an integration test that requires the backend server to be running.

Run with: uv run python tests/integration/test_onboarding_quick.py
"""

import requests

BASE_URL = "http://localhost:8000"


def test_onboarding_flow():
    """Test complete onboarding flow"""

    user_id = "test_user_demo"

    print("🧪 Testing User Onboarding API\n")

    # 1. Create onboarding data
    print("1️⃣ Creating onboarding data...")
    onboarding_data = {
        "work_preference": "remote",
        "adhd_support_level": 7,
        "adhd_challenges": ["time_blindness", "task_initiation", "focus"],
        "daily_schedule": {
            "time_preference": "morning",
            "flexible_enabled": False,
            "week_grid": {
                "monday": "8-17",
                "tuesday": "8-17",
                "wednesday": "flexible",
                "thursday": "8-17",
                "friday": "8-13",
            },
        },
        "productivity_goals": ["reduce_overwhelm", "increase_focus", "build_habits"],
    }

    response = requests.put(f"{BASE_URL}/api/v1/users/{user_id}/onboarding", json=onboarding_data)

    if response.status_code == 200:
        print("✅ Created successfully")
        data = response.json()
        print(f"   User ID: {data['user_id']}")
        print(f"   Work Preference: {data['work_preference']}")
        print(f"   ADHD Support Level: {data['adhd_support_level']}")
        print(f"   Challenges: {len(data['adhd_challenges'])} items")
        print(f"   Goals: {len(data['productivity_goals'])} items\n")
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
        return

    # 2. Get onboarding data
    print("2️⃣ Retrieving onboarding data...")
    response = requests.get(f"{BASE_URL}/api/v1/users/{user_id}/onboarding")

    if response.status_code == 200:
        print("✅ Retrieved successfully")
        data = response.json()
        print(f"   Onboarding completed: {data['onboarding_completed']}\n")
    else:
        print(f"❌ Failed: {response.status_code}\n")
        return

    # 3. Update ADHD level
    print("3️⃣ Updating ADHD support level...")
    response = requests.put(
        f"{BASE_URL}/api/v1/users/{user_id}/onboarding", json={"adhd_support_level": 9}
    )

    if response.status_code == 200:
        data = response.json()
        print(f"✅ Updated: ADHD level now {data['adhd_support_level']}\n")
    else:
        print(f"❌ Failed: {response.status_code}\n")
        return

    # 4. Add ChatGPT prompt
    print("4️⃣ Adding ChatGPT export prompt...")
    prompt = "You are helping someone with ADHD (level 9) who works remotely..."
    response = requests.put(
        f"{BASE_URL}/api/v1/users/{user_id}/onboarding", json={"chatgpt_export_prompt": prompt}
    )

    if response.status_code == 200:
        data = response.json()
        print(f"✅ Prompt added (exported at: {data['chatgpt_exported_at']})\n")
    else:
        print(f"❌ Failed: {response.status_code}\n")
        return

    # 5. Mark completed
    print("5️⃣ Marking onboarding as completed...")
    response = requests.post(
        f"{BASE_URL}/api/v1/users/{user_id}/onboarding/complete", json={"completed": True}
    )

    if response.status_code == 200:
        data = response.json()
        print(f"✅ Marked complete (completed_at: {data['completed_at']})\n")
    else:
        print(f"❌ Failed: {response.status_code}\n")
        return

    # 6. Delete onboarding
    print("6️⃣ Deleting onboarding data...")
    response = requests.delete(f"{BASE_URL}/api/v1/users/{user_id}/onboarding")

    if response.status_code == 204:
        print("✅ Deleted successfully\n")
    else:
        print(f"❌ Failed: {response.status_code}\n")
        return

    # 7. Verify deleted
    print("7️⃣ Verifying deletion...")
    response = requests.get(f"{BASE_URL}/api/v1/users/{user_id}/onboarding")

    if response.status_code == 404:
        print("✅ Confirmed: Data no longer exists\n")
    else:
        print(f"⚠️  Unexpected: {response.status_code}\n")

    print("🎉 All tests passed!")


if __name__ == "__main__":
    try:
        test_onboarding_flow()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to API server")
        print("   Make sure the server is running:")
        print("   uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")
