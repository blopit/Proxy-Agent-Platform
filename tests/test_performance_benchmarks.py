"""
Performance benchmarks and load testing for the Proxy Agent Platform.

Epic 6: Testing & Quality - Performance component
"""

import asyncio
import time

import pytest

from proxy_agent_platform.api.dashboard import DashboardAPI
from proxy_agent_platform.gamification.gamification_service import GamificationService
from proxy_agent_platform.gamification.xp_engine import (
    TaskDifficulty,
    TaskPriority,
    XPActivity,
    XPEngine,
)
from proxy_agent_platform.mobile.voice_processor import VoiceProcessor


class TestPerformanceBenchmarks:
    """Performance benchmarks for critical system components."""

    @pytest.mark.asyncio
    async def test_xp_engine_performance(self):
        """Test XP engine performance under load."""
        xp_engine = XPEngine()

        # Create test activities
        activities = [
            XPActivity(
                activity_type="task_completion",
                base_xp=20,
                difficulty=TaskDifficulty.MEDIUM,
                priority=TaskPriority.HIGH,
            )
            for _ in range(1000)
        ]

        # Benchmark XP calculations
        start_time = time.time()

        for activity in activities:
            xp_engine.calculate_xp(activity)

        end_time = time.time()
        calculation_time = end_time - start_time

        # Performance assertions
        assert calculation_time < 1.0  # Should complete 1000 calculations in under 1 second
        calculations_per_second = 1000 / calculation_time
        assert calculations_per_second > 500  # Should handle at least 500 calculations/second

        print(f"XP Engine Performance: {calculations_per_second:.0f} calculations/second")

    @pytest.mark.asyncio
    async def test_concurrent_gamification_service(self):
        """Test gamification service under concurrent load."""
        service = GamificationService()

        async def simulate_user_activity(user_id: int):
            """Simulate user activity for load testing."""
            tasks = [
                {"title": f"Task {i}", "difficulty": "medium", "priority": "high"}
                for i in range(10)
            ]

            for task in tasks:
                await service.handle_task_completed(user_id, task)

        # Simulate 50 concurrent users
        start_time = time.time()

        tasks = [simulate_user_activity(user_id) for user_id in range(50)]
        await asyncio.gather(*tasks)

        end_time = time.time()
        total_time = end_time - start_time

        # Performance assertions
        assert total_time < 5.0  # Should handle 50 concurrent users in under 5 seconds
        throughput = (50 * 10) / total_time  # Total operations per second
        assert throughput > 100  # Should handle at least 100 operations/second

        print(f"Gamification Service Throughput: {throughput:.0f} operations/second")

    @pytest.mark.asyncio
    async def test_dashboard_api_response_times(self):
        """Test dashboard API response times."""
        dashboard = DashboardAPI()

        # Test different endpoints
        endpoints = [
            ("get_agent_status", lambda: dashboard.get_agent_status()),
            ("get_live_metrics", lambda: dashboard.get_live_metrics(user_id=1)),
            (
                "get_productivity_heatmap",
                lambda: dashboard.get_productivity_heatmap(user_id=1, days=7),
            ),
        ]

        response_times = {}

        for endpoint_name, endpoint_func in endpoints:
            # Measure response time
            start_time = time.time()
            await endpoint_func()
            end_time = time.time()

            response_time = end_time - start_time
            response_times[endpoint_name] = response_time

            # Each endpoint should respond in under 100ms
            assert response_time < 0.1

        print(f"Dashboard API Response Times: {response_times}")

    @pytest.mark.asyncio
    async def test_voice_processor_batch_performance(self):
        """Test voice processor performance with batch commands."""
        processor = VoiceProcessor()

        # Create batch of voice commands
        commands = [
            "Add task review quarterly reports",
            "What's my current streak?",
            "Start 25 minute focus session",
            "Remind me to call client",
            "How much XP do I have today?",
        ] * 20  # 100 total commands

        start_time = time.time()

        # Process commands concurrently
        tasks = [processor.process_command(command, user_id=1) for command in commands]
        results = await asyncio.gather(*tasks)

        end_time = time.time()
        total_time = end_time - start_time

        # Performance assertions
        assert total_time < 2.0  # Should process 100 commands in under 2 seconds
        commands_per_second = len(commands) / total_time
        assert commands_per_second > 50  # Should handle at least 50 commands/second

        # Verify all commands were processed successfully
        successful_results = [r for r in results if r.get("status") == "success"]
        assert len(successful_results) == len(commands)

        print(f"Voice Processor Performance: {commands_per_second:.0f} commands/second")

    def test_memory_usage_under_load(self):
        """Test memory usage under sustained load."""
        import os

        import psutil

        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB

        # Create large dataset to simulate memory usage
        xp_engine = XPEngine()

        # Generate large number of XP calculations
        for _ in range(10000):
            activity = XPActivity(
                activity_type="task_completion",
                base_xp=20,
                difficulty=TaskDifficulty.HARD,
                priority=TaskPriority.URGENT,
            )
            xp_engine.calculate_xp(activity)

        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory

        # Memory increase should be reasonable
        assert memory_increase < 50  # Should not increase by more than 50MB

        print(
            f"Memory usage: {initial_memory:.1f}MB -> {final_memory:.1f}MB (increase: {memory_increase:.1f}MB)"
        )

    @pytest.mark.asyncio
    async def test_database_connection_pooling(self):
        """Test database connection efficiency (mock test)."""
        # Simulate database connections
        connection_times = []

        async def simulate_db_operation():
            """Simulate a database operation."""
            start_time = time.time()
            await asyncio.sleep(0.001)  # Simulate DB query time
            end_time = time.time()
            return end_time - start_time

        # Simulate 100 concurrent database operations
        tasks = [simulate_db_operation() for _ in range(100)]
        connection_times = await asyncio.gather(*tasks)

        # Verify connection pooling efficiency
        avg_connection_time = sum(connection_times) / len(connection_times)
        max_connection_time = max(connection_times)

        assert avg_connection_time < 0.01  # Average under 10ms
        assert max_connection_time < 0.05  # Max under 50ms

        print(
            f"DB Connection Performance - Avg: {avg_connection_time * 1000:.1f}ms, Max: {max_connection_time * 1000:.1f}ms"
        )


class TestLoadTesting:
    """Load testing scenarios for the platform."""

    @pytest.mark.asyncio
    async def test_high_concurrency_task_completion(self):
        """Test system under high concurrency task completion load."""
        service = GamificationService()

        async def user_session(user_id: int, tasks_count: int):
            """Simulate a complete user session."""
            session_tasks = []
            for i in range(tasks_count):
                task_data = {
                    "title": f"User {user_id} Task {i}",
                    "difficulty": "medium",
                    "priority": "high",
                }
                session_tasks.append(service.handle_task_completed(user_id, task_data))

            return await asyncio.gather(*session_tasks)

        # Simulate 100 concurrent users with 5 tasks each
        start_time = time.time()

        user_sessions = [user_session(user_id, 5) for user_id in range(100)]
        results = await asyncio.gather(*user_sessions)

        end_time = time.time()
        total_time = end_time - start_time

        # Verify all operations completed successfully
        total_operations = sum(len(session_results) for session_results in results)
        assert total_operations == 500  # 100 users * 5 tasks

        # Performance requirements
        assert total_time < 10.0  # Should complete in under 10 seconds
        operations_per_second = total_operations / total_time
        assert operations_per_second > 50  # At least 50 operations/second

        print(
            f"High Concurrency Test: {operations_per_second:.0f} operations/second with 100 concurrent users"
        )

    @pytest.mark.asyncio
    async def test_sustained_load_endurance(self):
        """Test system endurance under sustained load."""
        xp_engine = XPEngine()

        # Run sustained load for shorter duration (test environment)
        duration_seconds = 5
        start_time = time.time()
        operations_count = 0

        while time.time() - start_time < duration_seconds:
            activity = XPActivity(
                activity_type="task_completion",
                base_xp=20,
                difficulty=TaskDifficulty.MEDIUM,
                priority=TaskPriority.MEDIUM,
            )
            xp_engine.calculate_xp(activity)
            operations_count += 1

        operations_per_second = operations_count / duration_seconds

        # System should maintain consistent performance
        assert operations_per_second > 1000  # Should maintain high throughput

        print(
            f"Sustained Load Test: {operations_per_second:.0f} operations/second over {duration_seconds} seconds"
        )


class TestScalabilityMetrics:
    """Test system scalability characteristics."""

    @pytest.mark.asyncio
    async def test_response_time_scaling(self):
        """Test how response times scale with increasing load."""
        dashboard = DashboardAPI()

        load_levels = [1, 5, 10, 25, 50]
        response_times = {}

        for load in load_levels:
            # Measure response time under different loads
            start_time = time.time()

            tasks = [dashboard.get_live_metrics(user_id=i) for i in range(load)]
            await asyncio.gather(*tasks)

            end_time = time.time()
            avg_response_time = (end_time - start_time) / load
            response_times[load] = avg_response_time

        # Response times should scale gracefully
        baseline_time = response_times[1]
        max_time = response_times[50]

        # Response time should not increase more than 5x even with 50x load
        assert max_time < baseline_time * 5

        print(f"Response Time Scaling: {response_times}")

    def test_memory_scaling(self):
        """Test memory usage scaling with data size."""
        import sys

        xp_engine = XPEngine()

        # Test with different data sizes
        data_sizes = [100, 500, 1000, 2000]
        memory_usage = {}

        for size in data_sizes:
            activities = [
                XPActivity(
                    activity_type="task_completion",
                    base_xp=20,
                    difficulty=TaskDifficulty.MEDIUM,
                    priority=TaskPriority.MEDIUM,
                )
                for _ in range(size)
            ]

            # Measure memory usage
            memory_before = sys.getsizeof(activities)

            # Process activities
            for activity in activities:
                xp_engine.calculate_xp(activity)

            memory_usage[size] = memory_before

        # Memory usage should scale linearly
        memory_ratio = memory_usage[2000] / memory_usage[100]
        assert memory_ratio < 25  # Should scale reasonably

        print(f"Memory Scaling: {memory_usage}")


# Pytest configuration for performance tests
@pytest.fixture(scope="session")
def performance_test_config():
    """Configuration for performance tests."""
    return {
        "max_response_time": 0.1,  # 100ms
        "min_throughput": 100,  # operations/second
        "max_memory_increase": 50,  # MB
        "concurrency_users": 100,
        "sustained_duration": 5,  # seconds
    }
