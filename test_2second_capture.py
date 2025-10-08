#!/usr/bin/env python3
"""
Quick test script for 2-second task capture requirement
Tests the FastAPI endpoint performance using Ottomator patterns
"""

import asyncio
import time

import httpx


async def test_task_capture_speed():
    """Test if task capture meets 2-second requirement"""
    print("🧪 Testing 2-second task capture requirement...")

    # Test data
    test_requests = [
        "Add task: Call dentist tomorrow",
        "New task: Buy groceries",
        "Create task: Review quarterly report",
        "Add: Schedule team meeting",
        "Task: Update website content",
    ]

    base_url = "http://localhost:8000"

    async with httpx.AsyncClient() as client:
        for i, query in enumerate(test_requests, 1):
            print(f"\n📝 Test {i}: {query}")

            # Prepare request
            request_data = {
                "query": query,
                "user_id": "test_user",
                "session_id": "speed_test",
                "agent_type": "task",
            }

            # Time the request
            start_time = time.time()

            try:
                response = await client.post(
                    f"{base_url}/api/agents/quick-capture",
                    params={"query": query, "user_id": "test_user", "session_id": "speed_test"},
                    timeout=5.0,
                )
                end_time = time.time()

                # Calculate response time
                response_time_ms = (end_time - start_time) * 1000

                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ Success in {response_time_ms:.0f}ms: {result['message']}")

                    # Check if under 2 seconds
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

            # Small delay between tests
            await asyncio.sleep(0.1)


async def test_concurrent_captures():
    """Test multiple concurrent task captures"""
    print("\n🔄 Testing concurrent task captures...")

    tasks = [
        "Task 1: Morning standup",
        "Task 2: Code review",
        "Task 3: Update documentation",
        "Task 4: Client call",
        "Task 5: Project planning",
    ]

    async def capture_task(client, query, task_id):
        start_time = time.time()
        response = await client.post(
            "http://localhost:8000/api/agents/quick-capture",
            params={
                "query": query,
                "user_id": f"user_{task_id}",
                "session_id": f"concurrent_{task_id}",
            },
            timeout=5.0,
        )
        end_time = time.time()
        response_time = (end_time - start_time) * 1000
        return response_time, response.status_code

    async with httpx.AsyncClient() as client:
        start_time = time.time()

        # Run all captures concurrently
        results = await asyncio.gather(
            *[capture_task(client, task, i) for i, task in enumerate(tasks)]
        )

        total_time = (time.time() - start_time) * 1000

        print(f"\n📊 Concurrent Results ({len(tasks)} tasks in {total_time:.0f}ms):")
        for i, (response_time, status_code) in enumerate(results):
            status = "✅" if status_code == 200 else "❌"
            print(f"  Task {i + 1}: {response_time:.0f}ms {status}")

        # Check if all completed under 2 seconds
        max_time = max(result[0] for result in results)
        if max_time < 2000:
            print("🚀 All concurrent captures under 2 seconds!")
        else:
            print("⚠️  Some captures exceeded 2 seconds")


if __name__ == "__main__":
    print("🎯 Proxy Agent Platform - 2-Second Capture Test")
    print("=" * 50)

    try:
        asyncio.run(test_task_capture_speed())
        asyncio.run(test_concurrent_captures())
        print("\n✨ Test completed!")
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        print("\nMake sure the FastAPI server is running on localhost:8000")
        print("Run: uv run uvicorn agent.main:app --reload")
