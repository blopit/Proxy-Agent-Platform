"""
Report Generator for E2E Tests

Generates human-readable markdown reports for manual review of E2E test results.
Since LLMs cannot reliably validate LLM output, human review is essential.
"""

import json
import os
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


class ReportGenerator:
    """Generates human review reports for E2E tests"""

    def __init__(self, report_dir: str | None = None):
        """
        Initialize report generator.

        Args:
            report_dir: Directory to save reports (default: e2e/reports)
        """
        if report_dir:
            self.report_dir = Path(report_dir)
        else:
            # Default to e2e/reports directory
            test_dir = Path(__file__).parent.parent
            self.report_dir = test_dir / "reports"

        # Create report directory if it doesn't exist
        self.report_dir.mkdir(parents=True, exist_ok=True)

        # Track report sections
        self.sections: list[dict[str, Any]] = []
        self.metadata: dict[str, Any] = {}
        self.errors: list[str] = []
        self.test_start_time: datetime = datetime.now(UTC)

    def set_metadata(self, test_name: str, test_id: str, **kwargs: Any) -> None:
        """
        Set report metadata.

        Args:
            test_name: Name of the test
            test_id: Unique test identifier
            **kwargs: Additional metadata fields
        """
        self.metadata = {
            "test_name": test_name,
            "test_id": test_id,
            "executed_at": datetime.now(UTC).isoformat(),
            "environment": os.getenv("TEST_ENV", "local"),
            **kwargs,
        }

    def add_section(
        self,
        section_name: str,
        status: str,
        details: dict[str, Any],
        error: str | None = None,
    ) -> None:
        """
        Add a test section to the report.

        Args:
            section_name: Name of test section
            status: Status (✅ PASSED, ❌ FAILED, ⚠️ WARNING)
            details: Section details dictionary
            error: Optional error message
        """
        section = {
            "name": section_name,
            "status": status,
            "timestamp": datetime.now(UTC).isoformat(),
            "details": details,
        }

        if error:
            section["error"] = error
            self.errors.append(f"{section_name}: {error}")

        self.sections.append(section)

    def add_error(self, error: str) -> None:
        """
        Add an error to the report.

        Args:
            error: Error message
        """
        self.errors.append(error)

    def generate_report(self, test_passed: bool) -> str:
        """
        Generate the complete markdown report.

        Args:
            test_passed: Whether the overall test passed

        Returns:
            Markdown report content
        """
        duration = (datetime.now(UTC) - self.test_start_time).total_seconds()
        status_emoji = "✅ PASSED" if test_passed else "❌ FAILED"

        # Build markdown report
        lines = [
            f"# E2E Test Report: {self.metadata.get('test_name', 'Unknown')}",
            "",
            f"**Test ID**: {self.metadata.get('test_id', 'unknown')}",
            f"**Executed At**: {self.metadata.get('executed_at', 'unknown')}",
            f"**Duration**: {duration:.2f}s",
            f"**Status**: {status_emoji}",
            f"**Environment**: {self.metadata.get('environment', 'local')}",
            "",
        ]

        # Add test user info if available
        if "user_data" in self.metadata:
            user = self.metadata["user_data"]
            lines.extend(
                [
                    "## Test User",
                    "",
                    f"- **User ID**: {user.get('user_id', 'N/A')}",
                    f"- **Username**: {user.get('username', 'N/A')}",
                    f"- **Email**: {user.get('email', 'N/A')}",
                    f"- **Token**: {user.get('access_token', '')[:50]}...",
                    "",
                ]
            )

        # Add test execution sections
        lines.extend(["## Test Execution", ""])

        for i, section in enumerate(self.sections, 1):
            status = section["status"]
            lines.extend([f"### {i}. {section['name']} {status}", ""])

            # Add timestamp
            timestamp = section.get("timestamp", "N/A")
            lines.append(f"**Time**: {timestamp}")

            # Add details
            details = section.get("details", {})
            for key, value in details.items():
                # Format key nicely
                display_key = key.replace("_", " ").title()

                # Format value based on type
                if isinstance(value, dict | list):
                    lines.append(f"**{display_key}**:")
                    lines.append("```json")
                    lines.append(json.dumps(value, indent=2))
                    lines.append("```")
                else:
                    lines.append(f"**{display_key}**: {value}")

            # Add error if present
            if "error" in section:
                lines.extend(
                    [
                        "",
                        "**Error**:",
                        "```",
                        section["error"],
                        "```",
                    ]
                )

            lines.append("")

        # Add final state if available
        if "final_state" in self.metadata:
            lines.extend(
                [
                    "## Final State",
                    "",
                    "```json",
                    json.dumps(self.metadata["final_state"], indent=2),
                    "```",
                    "",
                ]
            )

        # Add human verification checklist
        lines.extend(
            [
                "## Human Verification Checklist",
                "",
                "- [ ] User was created successfully",
                "- [ ] All API calls returned expected status codes",
                "- [ ] Data consistency maintained throughout workflow",
                "- [ ] AI-generated content makes sense",
                "- [ ] No unexpected errors in execution",
                "- [ ] Gamification logic worked correctly",
                "- [ ] Database state is consistent",
                "",
            ]
        )

        # Add errors/warnings section
        if self.errors:
            lines.extend(["## Errors/Warnings", ""])
            for error in self.errors:
                lines.append(f"- {error}")
            lines.append("")

        # Add footer
        lines.extend(
            [
                "---",
                f"Generated by E2E Test Suite v1.0 at {datetime.now(UTC).isoformat()}",
            ]
        )

        return "\n".join(lines)

    def save_report(self, test_passed: bool) -> str:
        """
        Generate and save the report to a file.

        Args:
            test_passed: Whether the overall test passed

        Returns:
            Path to saved report file
        """
        report_content = self.generate_report(test_passed)

        # Generate filename with timestamp
        test_name = self.metadata.get("test_name", "unknown").lower().replace(" ", "_")
        timestamp = datetime.now(UTC).strftime("%Y%m%d_%H%M%S")
        filename = f"{test_name}_{timestamp}.md"

        report_path = self.report_dir / filename

        # Write report
        report_path.write_text(report_content, encoding="utf-8")

        return str(report_path)

    def get_summary(self) -> dict[str, Any]:
        """
        Get a summary of the test execution.

        Returns:
            Dictionary with test summary
        """
        total_sections = len(self.sections)
        passed_sections = sum(1 for s in self.sections if "✅" in s["status"])
        failed_sections = sum(1 for s in self.sections if "❌" in s["status"])

        duration = (datetime.now(UTC) - self.test_start_time).total_seconds()

        return {
            "test_name": self.metadata.get("test_name", "Unknown"),
            "test_id": self.metadata.get("test_id", "unknown"),
            "duration_seconds": duration,
            "total_sections": total_sections,
            "passed_sections": passed_sections,
            "failed_sections": failed_sections,
            "error_count": len(self.errors),
            "passed": failed_sections == 0,
        }
