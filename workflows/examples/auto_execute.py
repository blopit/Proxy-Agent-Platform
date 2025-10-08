#!/usr/bin/env python3
"""
Auto-Execution Script for Intelligent Project Orchestration.

This script implements the logic from AGENT_ENTRY_POINT.md to automatically
determine project state and execute the appropriate next workflow.
"""

import asyncio
import logging
import subprocess
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.append(str(project_root))

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class ProjectStateAnalyzer:
    """Analyzes current project state to determine next action."""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.state = None
        self.next_action = None
        self.reason = None

    def analyze_critical_issues(self):
        """Check for critical issues that must be resolved first."""
        logger.info("🔍 Checking for critical issues...")

        # Check CORS vulnerability
        cors_check = subprocess.run(
            ["grep", "-r", "allow_origins.*\\*", "agent/main.py"],
            cwd=self.project_root,
            capture_output=True,
            text=True,
        )
        if cors_check.returncode == 0:
            self.state = "CRITICAL_ISSUES_PRESENT"
            self.next_action = "workflows/critical/security-audit.yml"
            self.reason = "CORS vulnerability detected in agent/main.py"
            return True

        # Check if routers directory exists
        routers_dir = self.project_root / "agent" / "routers"
        if not routers_dir.exists():
            self.state = "CRITICAL_ISSUES_PRESENT"
            self.next_action = "workflows/critical/architecture-cleanup.yml"
            self.reason = "Missing agent/routers/ directory"
            return True

        # Check for broken imports
        try:
            from proxy_agent_platform.agents.base import BaseProxyAgent
        except ImportError as e:
            self.state = "CRITICAL_ISSUES_PRESENT"
            self.next_action = "workflows/critical/architecture-cleanup.yml"
            self.reason = f"Import error in base classes: {e}"
            return True

        logger.info("✅ No critical issues detected")
        return False

    def analyze_epic_progress(self):
        """Analyze progress on the 6 epics."""
        logger.info("📊 Analyzing epic progress...")

        # Check Epic 1 progress - Core Proxy Agents
        agents_dir = self.project_root / "proxy_agent_platform" / "agents"
        if not agents_dir.exists():
            self.state = "FOUNDATION_READY"
            self.next_action = "workflows/epic/epic-1-core-agents.yml"
            self.reason = "Agents directory doesn't exist - starting Epic 1"
            return

        # Count implemented proxy agents
        proxy_agents = list(agents_dir.glob("*_proxy.py"))
        core_agents = ["task_proxy.py", "focus_proxy.py", "energy_proxy.py", "progress_proxy.py"]
        implemented_core_agents = [agent for agent in core_agents if (agents_dir / agent).exists()]

        if len(implemented_core_agents) == 0:
            self.state = "FOUNDATION_READY"
            self.next_action = "workflows/epic/epic-1-core-agents.yml"
            self.reason = "No core agents implemented - starting Epic 1"
        elif len(implemented_core_agents) < 4:
            self.state = "EPIC_1_IN_PROGRESS"
            self.next_action = "workflows/epic/epic-1-core-agents.yml"
            self.reason = f"Epic 1 partial progress: {len(implemented_core_agents)}/4 core agents"
        else:
            # Check if Epic 1 is truly complete (has tests, validation, etc.)
            self.analyze_epic_1_completion()

    def analyze_epic_1_completion(self):
        """Check if Epic 1 is truly complete."""
        logger.info("🎯 Checking Epic 1 completion status...")

        # Check test coverage for agents
        try:
            result = subprocess.run(
                [
                    "uv",
                    "run",
                    "pytest",
                    "--cov=proxy_agent_platform.agents",
                    "--cov-report=term-missing",
                ],
                cwd=self.project_root,
                capture_output=True,
                text=True,
            )

            # Parse coverage percentage
            coverage_line = [line for line in result.stdout.split("\n") if "TOTAL" in line]
            if coverage_line:
                coverage_percent = float(coverage_line[0].split()[-1].rstrip("%"))
                if coverage_percent < 95:
                    self.state = "EPIC_1_IN_PROGRESS"
                    self.next_action = "workflows/epic/epic-1-core-agents.yml"
                    self.reason = f"Epic 1 test coverage insufficient: {coverage_percent}%"
                    return

        except Exception as e:
            logger.warning(f"Could not check test coverage: {e}")

        # If we get here, Epic 1 appears complete
        self.check_epic_2_status()

    def check_epic_2_status(self):
        """Check Epic 2 (Gamification) status."""
        logger.info("🎮 Checking Epic 2 (Gamification) status...")

        # Look for gamification components
        gamification_indicators = [
            "proxy_agent_platform/gamification",
            "agent/models/achievement.py",
            "agent/services/xp_calculator.py",
        ]

        gamification_exists = any(
            (self.project_root / indicator).exists() for indicator in gamification_indicators
        )

        if not gamification_exists:
            self.state = "EPIC_1_COMPLETE"
            self.next_action = "workflows/epic/epic-2-gamification.yml"
            self.reason = "Epic 1 complete, starting Epic 2 (Gamification)"
        else:
            self.check_remaining_epics()

    def check_remaining_epics(self):
        """Check status of remaining epics (3-6)."""
        logger.info("📱 Checking remaining epics status...")

        # This is a simplified check - in reality would be more comprehensive
        mobile_dir = self.project_root / "mobile"
        dashboard_components = self.project_root / "frontend" / "src" / "components" / "dashboard"

        if not mobile_dir.exists():
            self.state = "EPIC_2_COMPLETE"
            self.next_action = "workflows/epic/epic-3-mobile.yml"
            self.reason = "Epic 2 complete, starting Epic 3 (Mobile Integration)"
        elif not dashboard_components.exists():
            self.state = "EPIC_3_COMPLETE"
            self.next_action = "workflows/epic/epic-4-dashboard.yml"
            self.reason = "Epic 3 complete, starting Epic 4 (Dashboard)"
        else:
            # Advanced state - check for learning and quality systems
            self.check_advanced_state()

    def check_advanced_state(self):
        """Check advanced project state for final epics."""
        logger.info("🧠 Checking advanced project state...")

        learning_dir = self.project_root / "proxy_agent_platform" / "learning"
        if not learning_dir.exists():
            self.state = "EPIC_4_COMPLETE"
            self.next_action = "workflows/epic/epic-5-learning.yml"
            self.reason = "Epic 4 complete, starting Epic 5 (Learning & Optimization)"
        else:
            # Check if comprehensive testing is complete
            test_results = self.run_comprehensive_tests()
            if test_results["coverage"] < 95 or test_results["failures"] > 0:
                self.state = "EPIC_5_COMPLETE"
                self.next_action = "workflows/epic/epic-6-quality.yml"
                self.reason = "Epic 5 complete, starting Epic 6 (Quality & Testing)"
            else:
                self.state = "PROJECT_COMPLETE"
                self.next_action = None
                self.reason = "All epics complete - project finished! 🎉"

    def run_comprehensive_tests(self):
        """Run comprehensive test suite and return results."""
        try:
            result = subprocess.run(
                [
                    "uv",
                    "run",
                    "pytest",
                    "--cov=proxy_agent_platform",
                    "--cov-report=term-missing",
                    "-v",
                ],
                cwd=self.project_root,
                capture_output=True,
                text=True,
            )

            # Parse results
            coverage = 0
            failures = 0

            lines = result.stdout.split("\n")
            for line in lines:
                if "TOTAL" in line and "%" in line:
                    coverage = float(line.split()[-1].rstrip("%"))
                if "failed" in line.lower():
                    failures += 1

            return {"coverage": coverage, "failures": failures}

        except Exception as e:
            logger.warning(f"Could not run comprehensive tests: {e}")
            return {"coverage": 0, "failures": 999}

    def analyze_state(self):
        """Main state analysis method."""
        logger.info("🤖 Starting intelligent project state analysis...")

        # Check critical issues first (highest priority)
        if self.analyze_critical_issues():
            return

        # If no critical issues, analyze epic progress
        self.analyze_epic_progress()

        logger.info("📊 Analysis complete:")
        logger.info(f"   State: {self.state}")
        logger.info(f"   Next Action: {self.next_action}")
        logger.info(f"   Reason: {self.reason}")


async def execute_workflow(workflow_path: str, project_root: Path):
    """Execute the determined workflow."""
    logger.info(f"🚀 Executing workflow: {workflow_path}")

    try:
        # Import and initialize workflow engine
        from proxy_agent_platform.workflows import WorkflowEngine

        workflows_dir = project_root / "workflows"
        engine = WorkflowEngine(workflows_dir)

        # Extract workflow ID from path
        workflow_id = Path(workflow_path).stem.replace("-", "_")

        # Execute workflow
        result = await engine.execute_workflow(workflow_id)

        logger.info(f"✅ Workflow completed: {result.status}")
        logger.info(f"   Duration: {result.duration_seconds:.2f}s")
        logger.info(f"   Completed Steps: {len(result.completed_steps)}")

        if result.failed_steps:
            logger.error(f"❌ Failed Steps: {result.failed_steps}")

        return result

    except Exception as e:
        logger.error(f"❌ Workflow execution failed: {e}")
        import traceback

        traceback.print_exc()
        return None


def main():
    """Main execution function."""
    logger.info("🤖 Intelligent Project Orchestration Starting...")
    logger.info("=" * 60)

    # Initialize state analyzer
    analyzer = ProjectStateAnalyzer(project_root)

    # Analyze current state
    analyzer.analyze_state()

    # Execute appropriate action
    if analyzer.state == "PROJECT_COMPLETE":
        logger.info("🎉 PROJECT COMPLETE! All epics finished.")
        logger.info("🏆 The Proxy Agent Platform is ready for production!")
        return

    if analyzer.next_action:
        logger.info(f"🎯 Determined next action: {analyzer.next_action}")
        logger.info(f"📝 Reason: {analyzer.reason}")

        # Ask for confirmation in interactive mode
        if sys.stdin.isatty():  # Running interactively
            response = input(f"\n📋 Execute {analyzer.next_action}? [Y/n]: ")
            if response.lower().strip() in ["n", "no"]:
                logger.info("⏹️ Execution cancelled by user")
                return

        # Execute the workflow
        result = asyncio.run(execute_workflow(analyzer.next_action, project_root))

        if result and result.status == "completed":
            logger.info("✅ Workflow completed successfully!")
            logger.info("🔄 Run this script again to continue with next task")
        else:
            logger.error("❌ Workflow execution failed")
            sys.exit(1)

    else:
        logger.error("❌ Could not determine next action")
        logger.error("🔍 Manual analysis may be required")
        sys.exit(1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("\n⏹️ Execution interrupted by user")
    except Exception as e:
        logger.error(f"❌ Execution failed: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)
