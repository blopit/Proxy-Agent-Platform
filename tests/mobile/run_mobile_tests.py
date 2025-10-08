#!/usr/bin/env python3
"""
Mobile Component Test Runner

Comprehensive test runner for all mobile enhancements in the Proxy Agent Platform.
Provides detailed reporting, coverage analysis, and performance metrics.
"""

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))


class MobileTestRunner:
    """Comprehensive test runner for mobile components."""

    def __init__(self, verbose: bool = False, coverage: bool = True):
        self.verbose = verbose
        self.coverage = coverage
        self.test_results = {}
        self.start_time = None
        self.end_time = None

    def run_all_tests(self) -> dict[str, Any]:
        """Run all mobile component tests with comprehensive reporting."""
        print("🚀 Starting Mobile Component Test Suite")
        print("=" * 60)

        self.start_time = time.time()

        # Test components in order
        test_components = [
            ("notification_manager", "Notification Manager with ML-based timing"),
            ("voice_processor", "Voice Processor with advanced speech recognition"),
            ("offline_manager", "Offline Manager with sync conflict resolution"),
            ("wearable_integration", "Wearable Integration with health correlation"),
            ("mobile_workflow_bridge", "Mobile-Workflow Bridge integration")
        ]

        all_passed = True

        for component, description in test_components:
            print(f"\n📱 Testing {description}")
            print("-" * 50)

            success = self._run_component_tests(component)
            self.test_results[component] = success

            if success:
                print(f"✅ {component} tests PASSED")
            else:
                print(f"❌ {component} tests FAILED")
                all_passed = False

        self.end_time = time.time()

        # Run integration tests
        print("\n🔗 Running Integration Tests")
        print("-" * 50)
        integration_success = self._run_integration_tests()
        self.test_results["integration"] = integration_success

        if integration_success:
            print("✅ Integration tests PASSED")
        else:
            print("❌ Integration tests FAILED")
            all_passed = False

        # Generate final report
        self._generate_final_report(all_passed)

        return {
            "all_passed": all_passed,
            "component_results": self.test_results,
            "execution_time": self.end_time - self.start_time
        }

    def _run_component_tests(self, component: str) -> bool:
        """Run tests for a specific mobile component."""
        test_file = f"test_{component}.py"
        test_path = Path(__file__).parent / test_file

        if not test_path.exists():
            print(f"⚠️  Test file {test_file} not found")
            return False

        # Build pytest command
        cmd = ["python", "-m", "pytest", str(test_path), "-v"]

        if self.coverage:
            cmd.extend([
                "--cov=proxy_agent_platform.mobile",
                f"--cov-report=html:htmlcov/mobile_{component}",
                "--cov-report=term-missing"
            ])

        if self.verbose:
            cmd.append("-s")

        # Add markers for specific test types
        cmd.extend(["-m", "not slow"])  # Skip slow tests by default

        try:
            result = subprocess.run(
                cmd,
                cwd=project_root,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout
            )

            if self.verbose:
                print("STDOUT:", result.stdout)
                if result.stderr:
                    print("STDERR:", result.stderr)

            return result.returncode == 0

        except subprocess.TimeoutExpired:
            print(f"⏰ Tests for {component} timed out")
            return False
        except Exception as e:
            print(f"💥 Error running tests for {component}: {e}")
            return False

    def _run_integration_tests(self) -> bool:
        """Run integration tests for mobile components."""
        cmd = [
            "python", "-m", "pytest",
            str(Path(__file__).parent),
            "-v", "-m", "integration"
        ]

        if self.coverage:
            cmd.extend([
                "--cov=proxy_agent_platform.mobile",
                "--cov-report=html:htmlcov/mobile_integration",
                "--cov-append"
            ])

        try:
            result = subprocess.run(
                cmd,
                cwd=project_root,
                capture_output=True,
                text=True,
                timeout=600  # 10 minutes for integration tests
            )

            if self.verbose:
                print("Integration Test Output:")
                print(result.stdout)

            return result.returncode == 0

        except Exception as e:
            print(f"💥 Error running integration tests: {e}")
            return False

    def _generate_final_report(self, all_passed: bool):
        """Generate comprehensive test report."""
        print("\n" + "=" * 60)
        print("📊 MOBILE COMPONENT TEST RESULTS")
        print("=" * 60)

        # Component results
        for component, passed in self.test_results.items():
            status = "✅ PASSED" if passed else "❌ FAILED"
            print(f"{component:25} {status}")

        print("-" * 60)

        # Overall result
        overall_status = "✅ ALL TESTS PASSED" if all_passed else "❌ SOME TESTS FAILED"
        print(f"Overall Result: {overall_status}")

        # Execution time
        execution_time = self.end_time - self.start_time
        print(f"Total Execution Time: {execution_time:.2f} seconds")

        # Coverage information
        if self.coverage:
            print("\n📈 Coverage reports generated in htmlcov/ directory")

        print("\n🎯 Test Summary:")
        print("   • Notification Manager: ML-based timing optimization")
        print("   • Voice Processor: Advanced speech recognition")
        print("   • Offline Manager: Robust sync conflict resolution")
        print("   • Wearable Integration: Health data correlation")
        print("   • Mobile-Workflow Bridge: Seamless integration")

        if all_passed:
            print("\n🎉 All mobile enhancements successfully tested!")
        else:
            print("\n🔧 Some tests failed. Please review the output above.")

    def run_specific_component(self, component: str) -> bool:
        """Run tests for a specific component only."""
        print(f"🎯 Running tests for {component}")
        return self._run_component_tests(component)

    def run_performance_tests(self) -> dict[str, Any]:
        """Run performance-focused tests."""
        print("⚡ Running Performance Tests")
        print("-" * 40)

        cmd = [
            "python", "-m", "pytest",
            str(Path(__file__).parent),
            "-v", "-m", "not slow",
            "--benchmark-only"
        ]

        try:
            result = subprocess.run(
                cmd,
                cwd=project_root,
                capture_output=True,
                text=True,
                timeout=600
            )

            success = result.returncode == 0
            print("✅ Performance tests completed" if success else "❌ Performance tests failed")

            return {
                "success": success,
                "output": result.stdout
            }

        except Exception as e:
            print(f"💥 Error running performance tests: {e}")
            return {"success": False, "error": str(e)}

    def generate_test_coverage_report(self):
        """Generate detailed test coverage report."""
        print("📊 Generating Coverage Report")

        cmd = [
            "python", "-m", "pytest",
            str(Path(__file__).parent),
            "--cov=proxy_agent_platform.mobile",
            "--cov-report=html:htmlcov/mobile_complete",
            "--cov-report=term-missing",
            "--cov-report=json:coverage_mobile.json"
        ]

        try:
            result = subprocess.run(cmd, cwd=project_root, capture_output=True, text=True)

            if result.returncode == 0:
                print("✅ Coverage report generated successfully")
                print("   📁 HTML report: htmlcov/mobile_complete/index.html")
                print("   📄 JSON report: coverage_mobile.json")

                # Parse and display key metrics
                self._display_coverage_metrics()
            else:
                print("❌ Failed to generate coverage report")

        except Exception as e:
            print(f"💥 Error generating coverage report: {e}")

    def _display_coverage_metrics(self):
        """Display key coverage metrics."""
        try:
            with open(project_root / "coverage_mobile.json") as f:
                coverage_data = json.load(f)

            total_coverage = coverage_data["totals"]["percent_covered"]
            print(f"\n📈 Overall Coverage: {total_coverage:.1f}%")

            print("\n📋 Coverage by Component:")
            for filename, data in coverage_data["files"].items():
                if "mobile" in filename:
                    component_name = Path(filename).stem
                    coverage_pct = data["summary"]["percent_covered"]
                    print(f"   {component_name:25} {coverage_pct:5.1f}%")

        except Exception as e:
            print(f"⚠️  Could not parse coverage data: {e}")


def main():
    """Main test runner entry point."""
    parser = argparse.ArgumentParser(description="Mobile Component Test Runner")
    parser.add_argument("--component", "-c", help="Run tests for specific component only")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--no-coverage", action="store_true", help="Disable coverage reporting")
    parser.add_argument("--performance", "-p", action="store_true", help="Run performance tests")
    parser.add_argument("--coverage-only", action="store_true", help="Generate coverage report only")

    args = parser.parse_args()

    runner = MobileTestRunner(
        verbose=args.verbose,
        coverage=not args.no_coverage
    )

    if args.coverage_only:
        runner.generate_test_coverage_report()
    elif args.performance:
        runner.run_performance_tests()
    elif args.component:
        success = runner.run_specific_component(args.component)
        sys.exit(0 if success else 1)
    else:
        results = runner.run_all_tests()
        sys.exit(0 if results["all_passed"] else 1)


if __name__ == "__main__":
    main()
