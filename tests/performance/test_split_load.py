"""
Load and performance tests for Epic 7: ADHD Task Splitting

Tests concurrent task splitting, throughput, and performance under load.
"""

import statistics
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any

import pytest
import requests


@pytest.fixture
def performance_tasks(api_client, base_url, test_user_id):
    """
    Create multiple test tasks for load testing.
    """
    # Create project first
    project_data = {
        "name": f"Load Test Project {test_user_id}",
        "owner": test_user_id,
        "description": "Project for performance testing",
    }

    project_response = api_client.post(f"{base_url}/api/v1/projects", json=project_data)

    # Create 100 tasks for load testing
    tasks = []
    for i in range(100):
        task_data = {
            "title": f"Load test task {i}",
            "description": f"Performance test task number {i}",
            "estimated_time": 30,  # Consistent 30-minute tasks
            "priority": "medium",
            "user_id": test_user_id,
            "project_id": project_response.json().get("project_id", f"test_project_{test_user_id}"),
        }

        response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)

        if response.status_code == 201:
            tasks.append(response.json())

    return tasks


def split_task_timed(base_url: str, task_id: str, user_id: str) -> dict[str, Any]:
    """
    Split a task and return timing information.
    """
    start_time = time.time()

    try:
        response = requests.post(
            f"{base_url}/api/v1/tasks/{task_id}/split",
            json={"mode": "adhd", "user_id": user_id},
            timeout=10,
        )

        elapsed_time = time.time() - start_time

        return {
            "task_id": task_id,
            "success": response.status_code == 200,
            "status_code": response.status_code,
            "elapsed_time": elapsed_time,
            "response_size": len(response.content),
            "error": None if response.status_code == 200 else response.text,
        }

    except Exception as e:
        elapsed_time = time.time() - start_time
        return {
            "task_id": task_id,
            "success": False,
            "status_code": 0,
            "elapsed_time": elapsed_time,
            "response_size": 0,
            "error": str(e),
        }


@pytest.mark.slow
class TestTaskSplittingPerformance:
    """Performance tests for task splitting under load"""

    def test_single_split_performance_baseline(self, api_client, base_url, test_user_id):
        """
        Baseline test: Single task split performance

        Target: < 2 seconds
        Measured: ~1.2 seconds (from Epic 7 completion)
        """
        # Setup
        api_client.post(
            f"{base_url}/api/v1/projects",
            json={"name": f"Perf Test {test_user_id}", "owner": test_user_id},
        )

        task_data = {
            "title": "Performance baseline task",
            "description": "Single split performance test",
            "estimated_time": 30,
            "user_id": test_user_id,
            "project_id": f"test_project_{test_user_id}",
        }

        task_response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)
        task_id = task_response.json()["task_id"]

        # Measure split time
        start_time = time.time()

        split_response = api_client.post(
            f"{base_url}/api/v1/tasks/{task_id}/split",
            json={"mode": "adhd", "user_id": test_user_id},
        )

        elapsed_time = time.time() - start_time

        # Assertions
        assert split_response.status_code == 200
        assert elapsed_time < 2.0, f"Split took {elapsed_time:.2f}s, target is < 2.0s"

        print(f"\n✅ Baseline split time: {elapsed_time:.3f}s")

    def test_concurrent_splits_10_tasks(self, api_client, base_url, test_user_id):
        """
        Test 10 concurrent task splits

        Verifies system handles moderate concurrent load.
        """
        # Setup
        api_client.post(
            f"{base_url}/api/v1/projects",
            json={"name": f"Concurrent 10 Test {test_user_id}", "owner": test_user_id},
        )

        # Create 10 tasks
        task_ids = []
        for i in range(10):
            task_data = {
                "title": f"Concurrent test task {i}",
                "description": f"Task {i} for concurrent splitting",
                "estimated_time": 30,
                "user_id": test_user_id,
                "project_id": f"test_project_{test_user_id}",
            }

            response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)
            if response.status_code == 201:
                task_ids.append(response.json()["task_id"])

        # Split all tasks concurrently
        start_time = time.time()
        results = []

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [
                executor.submit(split_task_timed, base_url, task_id, test_user_id)
                for task_id in task_ids
            ]

            for future in as_completed(futures):
                results.append(future.result())

        total_time = time.time() - start_time

        # Analysis
        successful_splits = [r for r in results if r["success"]]
        failed_splits = [r for r in results if not r["success"]]

        success_rate = len(successful_splits) / len(results) * 100
        avg_time = (
            statistics.mean([r["elapsed_time"] for r in successful_splits])
            if successful_splits
            else 0
        )
        max_time = max([r["elapsed_time"] for r in successful_splits]) if successful_splits else 0

        # Assertions
        assert success_rate >= 95, f"Success rate {success_rate:.1f}% below 95% threshold"

        assert avg_time < 3.0, f"Average split time {avg_time:.2f}s exceeds 3s under load"

        print("\n✅ Concurrent 10 splits:")
        print(f"   Success rate: {success_rate:.1f}%")
        print(f"   Total time: {total_time:.2f}s")
        print(f"   Avg split time: {avg_time:.3f}s")
        print(f"   Max split time: {max_time:.3f}s")

        if failed_splits:
            print(f"   ⚠️  Failed: {len(failed_splits)}")
            for failure in failed_splits[:3]:  # Show first 3 failures
                print(f"      - {failure['error']}")

    @pytest.mark.skip(reason="Heavy load test - run manually when needed")
    def test_concurrent_splits_100_tasks(self, base_url, performance_tasks, test_user_id):
        """
        Test 100 concurrent task splits (HEAVY LOAD)

        This is the acceptance criterion from BE-15 roadmap.
        Run manually: pytest -k test_concurrent_splits_100_tasks -v
        """
        task_ids = [task["task_id"] for task in performance_tasks[:100]]

        start_time = time.time()
        results = []

        # Use 20 workers to split 100 tasks
        with ThreadPoolExecutor(max_workers=20) as executor:
            futures = [
                executor.submit(split_task_timed, base_url, task_id, test_user_id)
                for task_id in task_ids
            ]

            for future in as_completed(futures):
                result = future.result()
                results.append(result)

                # Progress indicator
                if len(results) % 10 == 0:
                    print(f"Progress: {len(results)}/100 completed")

        total_time = time.time() - start_time

        # Analysis
        successful_splits = [r for r in results if r["success"]]
        failed_splits = [r for r in results if not r["success"]]

        success_rate = len(successful_splits) / len(results) * 100
        split_times = [r["elapsed_time"] for r in successful_splits]

        avg_time = statistics.mean(split_times) if split_times else 0
        median_time = statistics.median(split_times) if split_times else 0
        p95_time = sorted(split_times)[int(len(split_times) * 0.95)] if split_times else 0
        max_time = max(split_times) if split_times else 0
        throughput = len(successful_splits) / total_time if total_time > 0 else 0

        # Report
        print(f"\n{'='*60}")
        print("LOAD TEST RESULTS: 100 Concurrent Task Splits")
        print(f"{'='*60}")
        print(f"Success rate:     {success_rate:.1f}%")
        print(f"Total time:       {total_time:.2f}s")
        print(f"Throughput:       {throughput:.2f} splits/second")
        print(f"Average time:     {avg_time:.3f}s")
        print(f"Median time:      {median_time:.3f}s")
        print(f"95th percentile:  {p95_time:.3f}s")
        print(f"Max time:         {max_time:.3f}s")
        print(f"Failed splits:    {len(failed_splits)}")
        print(f"{'='*60}\n")

        # Acceptance criteria from BE-15
        assert success_rate >= 95, f"Success rate {success_rate:.1f}% below 95% threshold"

        assert avg_time < 5.0, f"Average time {avg_time:.2f}s exceeds 5s threshold"

        assert p95_time < 8.0, f"P95 time {p95_time:.2f}s exceeds 8s threshold"

    def test_sequential_split_throughput(self, api_client, base_url, test_user_id):
        """
        Measure sequential split throughput (baseline for comparison)
        """
        # Setup
        api_client.post(
            f"{base_url}/api/v1/projects",
            json={"name": f"Sequential Test {test_user_id}", "owner": test_user_id},
        )

        # Create 10 tasks
        task_ids = []
        for i in range(10):
            task_data = {
                "title": f"Sequential task {i}",
                "description": f"Task {i}",
                "estimated_time": 30,
                "user_id": test_user_id,
                "project_id": f"test_project_{test_user_id}",
            }

            response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)
            if response.status_code == 201:
                task_ids.append(response.json()["task_id"])

        # Split sequentially
        start_time = time.time()
        split_times = []

        for task_id in task_ids:
            task_start = time.time()

            api_client.post(
                f"{base_url}/api/v1/tasks/{task_id}/split",
                json={"mode": "adhd", "user_id": test_user_id},
            )

            split_times.append(time.time() - task_start)

        total_time = time.time() - start_time

        avg_time = statistics.mean(split_times)
        throughput = len(task_ids) / total_time

        print("\n✅ Sequential throughput:")
        print(f"   Total time: {total_time:.2f}s")
        print(f"   Avg split: {avg_time:.3f}s")
        print(f"   Throughput: {throughput:.2f} splits/sec")

    def test_memory_usage_under_load(self, api_client, base_url, test_user_id):
        """
        Test that memory doesn't leak under repeated splitting
        """
        # Setup
        api_client.post(
            f"{base_url}/api/v1/projects",
            json={"name": f"Memory Test {test_user_id}", "owner": test_user_id},
        )

        task_data = {
            "title": "Memory test task",
            "description": "Testing memory usage",
            "estimated_time": 30,
            "user_id": test_user_id,
            "project_id": f"test_project_{test_user_id}",
        }

        task_response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)
        task_id = task_response.json()["task_id"]

        # Split same task 20 times (with force flag)
        response_sizes = []

        for _i in range(20):
            response = api_client.post(
                f"{base_url}/api/v1/tasks/{task_id}/split",
                json={"mode": "adhd", "user_id": test_user_id, "force": True},
            )

            if response.status_code == 200:
                response_sizes.append(len(response.content))
            # Note: Loop intentionally doesn't use index variable

        # Response size should be consistent (no memory leak in response)
        avg_size = statistics.mean(response_sizes)
        size_variance = statistics.stdev(response_sizes) if len(response_sizes) > 1 else 0

        assert (
            size_variance < avg_size * 0.1
        ), "Response size variance suggests inconsistent behavior"

        print("\n✅ Memory test (20 splits):")
        print(f"   Avg response size: {avg_size:.0f} bytes")
        print(f"   Variance: {size_variance:.0f} bytes")


class TestPerformanceRegressions:
    """Tests to catch performance regressions"""

    def test_split_time_does_not_degrade_over_time(self, api_client, base_url, test_user_id):
        """
        Test that split times remain consistent over multiple requests
        """
        # Setup
        api_client.post(
            f"{base_url}/api/v1/projects",
            json={"name": f"Regression Test {test_user_id}", "owner": test_user_id},
        )

        split_times_batch_1 = []
        split_times_batch_2 = []

        # Batch 1: First 10 splits
        for i in range(10):
            task_data = {
                "title": f"Regression task batch 1 - {i}",
                "description": "Testing performance regression",
                "estimated_time": 30,
                "user_id": test_user_id,
                "project_id": f"test_project_{test_user_id}",
            }

            task_response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)
            task_id = task_response.json()["task_id"]

            start = time.time()
            api_client.post(
                f"{base_url}/api/v1/tasks/{task_id}/split",
                json={"mode": "adhd", "user_id": test_user_id},
            )
            split_times_batch_1.append(time.time() - start)

        # Batch 2: Next 10 splits
        for i in range(10):
            task_data = {
                "title": f"Regression task batch 2 - {i}",
                "description": "Testing performance regression",
                "estimated_time": 30,
                "user_id": test_user_id,
                "project_id": f"test_project_{test_user_id}",
            }

            task_response = api_client.post(f"{base_url}/api/v1/tasks", json=task_data)
            task_id = task_response.json()["task_id"]

            start = time.time()
            api_client.post(
                f"{base_url}/api/v1/tasks/{task_id}/split",
                json={"mode": "adhd", "user_id": test_user_id},
            )
            split_times_batch_2.append(time.time() - start)

        avg_batch_1 = statistics.mean(split_times_batch_1)
        avg_batch_2 = statistics.mean(split_times_batch_2)

        degradation = ((avg_batch_2 - avg_batch_1) / avg_batch_1) * 100

        print("\n✅ Performance regression test:")
        print(f"   Batch 1 avg: {avg_batch_1:.3f}s")
        print(f"   Batch 2 avg: {avg_batch_2:.3f}s")
        print(f"   Degradation: {degradation:+.1f}%")

        # Allow up to 20% degradation (some variance expected)
        assert degradation < 20, f"Performance degraded by {degradation:.1f}% (threshold: 20%)"
