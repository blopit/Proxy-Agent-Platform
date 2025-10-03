#!/usr/bin/env python3
"""
Simple 2-second capture test for new SQLite structure
"""

import asyncio
import time

import httpx


async def test_quick_capture():
    """Test the quick capture endpoint performance"""
    print("🧪 Testing 2-second task capture with SQLite...")

    tasks = [
        "Add task: Call mom",
        "Buy groceries",
        "Schedule dentist appointment",
        "Review quarterly report",
        "Team standup at 9am"
    ]

    base_url = "http://localhost:8000"

    async with httpx.AsyncClient() as client:
        for i, task in enumerate(tasks, 1):
            print(f"\n📝 Test {i}: {task}")

            start_time = time.time()

            try:
                response = await client.post(
                    f"{base_url}/api/quick-capture",
                    params={
                        "query": task,
                        "user_id": "test_user",
                        "session_id": "speed_test"
                    },
                    timeout=3.0
                )

                end_time = time.time()
                response_time_ms = (end_time - start_time) * 1000

                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ {response_time_ms:.0f}ms - {result['message']}")
                    print(f"   XP: {result['xp_earned']}, Processing: {result['processing_time_ms']}ms")

                    if response_time_ms < 2000:
                        print("🚀 PASSED: Under 2-second requirement")
                    else:
                        print("⚠️  SLOW: Over 2-second requirement")
                else:
                    print(f"❌ Failed: {response.status_code}")

            except Exception as e:
                end_time = time.time()
                response_time_ms = (end_time - start_time) * 1000
                print(f"❌ Error in {response_time_ms:.0f}ms: {e}")

    # Test history retrieval
    print("\n📋 Testing history retrieval...")
    async with httpx.AsyncClient() as client:
        start_time = time.time()
        response = await client.get(f"{base_url}/api/history/speed_test")
        end_time = time.time()

        if response.status_code == 200:
            history = response.json()
            print(f"✅ History retrieved in {(end_time - start_time) * 1000:.0f}ms")
            print(f"   Found {len(history['messages'])} messages")
        else:
            print(f"❌ History failed: {response.status_code}")


if __name__ == "__main__":
    print("🎯 Proxy Agent Platform - SQLite Performance Test")
    print("=" * 50)

    try:
        asyncio.run(test_quick_capture())
        print("\n✨ Test completed!")
        print("\nTo start the server: python -m src.api.main")
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        print("\nMake sure to start the server first:")
        print("python -m src.api.main")
