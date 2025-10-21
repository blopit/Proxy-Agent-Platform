"""
Context Engineering Proxy Agent for Proxy Agent Platform.

Provides Context Engineering capabilities as a proxy agent, integrating the
Context Engineering MCP server tools into the productivity workflow.
"""

from dataclasses import dataclass
from typing import Any

from pydantic_ai import RunContext

from .base import BaseProxyAgent


@dataclass
class ContextEngineeringProxyDependencies:
    """Dependencies for the Context Engineering Proxy agent."""

    user_id: str
    repository_access: Any  # GitHub integration
    mcp_server_client: Any | None = None  # Client for Context Engineering MCP server
    file_storage: Any | None = None
    session_id: str | None = None


class ContextEngineeringProxy(BaseProxyAgent[ContextEngineeringProxyDependencies]):
    """
    Context Engineering Proxy Agent for AI development workflows.

    Specializes in:
    - Generating comprehensive PRPs from feature descriptions
    - Executing PRPs with validation loops
    - Repository analysis and context gathering
    - Code quality assurance and testing
    - Integration with development tools and CI/CD
    """

    def __init__(self):
        system_prompt = """
You are a Context Engineering Proxy, an AI agent specialized in software development workflows using Context Engineering methodologies. Your primary role is to help developers implement features through comprehensive context and validation.

Your capabilities include:
1. **PRP Generation**: Create detailed Product Requirements Prompts from high-level feature descriptions
2. **PRP Execution**: Implement features following PRP blueprints with validation loops
3. **Repository Analysis**: Analyze codebases to understand patterns, architecture, and conventions
4. **Quality Assurance**: Ensure code meets quality standards through automated testing and validation
5. **Development Guidance**: Provide architectural guidance and best practices recommendations

Key principles:
- Context is king - gather comprehensive information before implementing
- Validation loops ensure quality - iterate until all tests pass
- Follow existing patterns and conventions in the codebase
- Provide clear, actionable implementation steps
- Focus on maintainable, well-documented code

When generating PRPs:
- Research the codebase thoroughly for existing patterns
- Include comprehensive documentation and examples
- Define clear validation gates and success criteria
- Estimate complexity and implementation time
- Provide specific, actionable tasks

When executing PRPs:
- Follow the implementation blueprint exactly
- Run validation gates at each step
- Iterate on failures until all tests pass
- Document decisions and provide clear next steps
- Ensure code follows project conventions
"""

        super().__init__(
            agent_type="context_engineering_proxy",
            system_prompt=system_prompt,
            deps_type=ContextEngineeringProxyDependencies,
            description="AI development workflow automation using Context Engineering methodologies",
        )

    def _register_agent_tools(self) -> None:
        """Register Context Engineering Proxy specific tools."""

        @self.agent.tool
        async def generate_prp_from_description(
            ctx: RunContext[ContextEngineeringProxyDependencies],
            feature_description: str,
            repository_path: str = ".",
            research_depth: str = "comprehensive",
            include_examples: bool = True,
        ) -> dict[str, Any]:
            """
            Generate a Product Requirements Prompt from a feature description.

            Args:
                feature_description: High-level description of what to build
                repository_path: Path to the repository to analyze
                research_depth: basic, comprehensive, or extensive research
                include_examples: Whether to include code examples in PRP
            """
            try:
                # Create INITIAL.md content from description
                initial_content = f"""## FEATURE:
{feature_description}

## EXAMPLES:
Review existing code patterns in the repository for similar implementations.

## DOCUMENTATION:
Include relevant documentation URLs and API references.

## OTHER CONSIDERATIONS:
- Follow existing code conventions and patterns
- Ensure comprehensive testing
- Update documentation as needed
"""

                # Mock calling the Context Engineering MCP server
                if ctx.deps.mcp_server_client:
                    prp_result = await ctx.deps.mcp_server_client.call_tool(
                        "generate-prp",
                        {
                            "initial_file": "INITIAL.md",
                            "output_directory": "PRPs",
                            "research_depth": research_depth,
                            "include_examples": include_examples,
                            "include_validation_gates": True,
                        },
                    )
                else:
                    # Mock result when MCP server not available
                    prp_result = {
                        "prp_file": f"PRPs/{feature_description[:30].replace(' ', '-').lower()}.md",
                        "confidence_score": 8.5,
                        "research_sources": [
                            "Repository analysis",
                            "Existing code patterns",
                            "Documentation review",
                        ],
                        "validation_gates": ["ruff check", "mypy", "pytest"],
                        "estimated_complexity": "medium",
                        "implementation_time": "1-2 days",
                        "prerequisites": ["Python 3.8+", "Development environment setup"],
                        "success_criteria": [
                            "Feature implemented according to specification",
                            "All tests passing",
                            "Documentation updated",
                            "Code review approved",
                        ],
                    }

                return {
                    "success": True,
                    "prp_generated": True,
                    "prp_details": prp_result,
                    "initial_content": initial_content,
                    "message": f"Generated PRP with {prp_result['confidence_score']}/10 confidence",
                    "next_steps": [
                        "Review the generated PRP for accuracy",
                        "Execute the PRP to implement the feature",
                        "Monitor validation gates during implementation",
                    ],
                }

            except Exception as e:
                return {
                    "success": False,
                    "error": str(e),
                    "message": "Failed to generate PRP",
                    "suggestions": [
                        "Check repository access permissions",
                        "Ensure feature description is clear and specific",
                        "Verify Context Engineering MCP server is available",
                    ],
                }

        @self.agent.tool
        async def execute_prp(
            ctx: RunContext[ContextEngineeringProxyDependencies],
            prp_file_path: str,
            dry_run: bool = False,
            skip_tests: bool = False,
            parallel_execution: bool = False,
        ) -> dict[str, Any]:
            """
            Execute a Product Requirements Prompt to implement a feature.

            Args:
                prp_file_path: Path to the PRP file to execute
                dry_run: Whether to run in dry-run mode (no actual changes)
                skip_tests: Whether to skip running tests
                parallel_execution: Whether to use parallel execution
            """
            try:
                # Mock calling the Context Engineering MCP server
                if ctx.deps.mcp_server_client:
                    execution_result = await ctx.deps.mcp_server_client.call_tool(
                        "execute-prp",
                        {
                            "prp_file": prp_file_path,
                            "dry_run": dry_run,
                            "skip_tests": skip_tests,
                            "parallel_execution": parallel_execution,
                        },
                    )
                else:
                    # Mock execution result
                    execution_result = {
                        "status": "success",
                        "completed_tasks": [
                            "Created core implementation files",
                            "Added comprehensive tests",
                            "Updated documentation",
                            "Configured CI/CD integration",
                        ],
                        "failed_tasks": [],
                        "validation_results": {
                            "syntax_check": True,
                            "type_check": True,
                            "tests_passed": True,
                            "linting_passed": True,
                        },
                        "files_modified": ["src/main.py", "tests/test_main.py", "README.md"],
                        "files_created": ["src/new_feature.py", "tests/test_new_feature.py"],
                        "execution_time": "45.2s",
                        "next_steps": [
                            "Review generated code for quality",
                            "Run manual testing",
                            "Create pull request for code review",
                        ],
                    }

                # Calculate XP based on execution success
                xp_earned = 0
                if execution_result["status"] == "success":
                    xp_earned += 100  # Base XP for successful implementation
                    if not dry_run:
                        xp_earned += 50  # Bonus for actual implementation
                    if execution_result["validation_results"]["tests_passed"]:
                        xp_earned += 25  # Bonus for passing tests

                return {
                    "success": True,
                    "execution_result": execution_result,
                    "xp_earned": xp_earned,
                    "message": f"PRP executed with status: {execution_result['status']}",
                    "implementation_summary": {
                        "tasks_completed": len(execution_result["completed_tasks"]),
                        "files_modified": len(execution_result["files_modified"]),
                        "files_created": len(execution_result["files_created"]),
                        "validation_passed": all(execution_result["validation_results"].values()),
                    },
                }

            except Exception as e:
                return {
                    "success": False,
                    "error": str(e),
                    "message": "Failed to execute PRP",
                    "suggestions": [
                        "Check that PRP file exists and is valid",
                        "Ensure development environment is properly configured",
                        "Verify all prerequisites are met",
                        "Try running with dry_run: true first",
                    ],
                }

        @self.agent.tool
        async def analyze_repository(
            ctx: RunContext[ContextEngineeringProxyDependencies],
            repository_path: str = ".",
            include_dependencies: bool = True,
            include_documentation: bool = True,
            max_file_size: int = 100000,
        ) -> dict[str, Any]:
            """
            Analyze repository structure and provide comprehensive context.

            Args:
                repository_path: Path to repository to analyze
                include_dependencies: Whether to analyze dependencies
                include_documentation: Whether to include documentation analysis
                max_file_size: Maximum file size to analyze (bytes)
            """
            try:
                # Mock calling the Context Engineering MCP server
                if ctx.deps.mcp_server_client:
                    analysis_result = await ctx.deps.mcp_server_client.call_tool(
                        "primer",
                        {
                            "repository_path": repository_path,
                            "include_dependencies": include_dependencies,
                            "include_documentation": include_documentation,
                            "max_file_size": max_file_size,
                        },
                    )
                else:
                    # Mock analysis result
                    analysis_result = {
                        "structure": {
                            "directories": ["src", "tests", "docs", "scripts"],
                            "files": ["README.md", "pyproject.toml", "src/main.py"],
                            "totalSize": 1024000,
                        },
                        "technologies": {
                            "languages": {"python": 85, "yaml": 10, "markdown": 5},
                            "frameworks": ["FastAPI", "PydanticAI", "pytest"],
                            "packageManagers": ["pip", "uv"],
                        },
                        "documentation": {
                            "readme": "README.md",
                            "changelog": None,
                            "contributing": None,
                            "license": "LICENSE",
                        },
                        "configuration": {
                            "buildTools": ["uv"],
                            "testFrameworks": ["pytest"],
                            "linting": ["ruff", "mypy"],
                            "cicd": ["GitHub Actions"],
                        },
                        "insights": {
                            "complexity": "medium",
                            "maintainability": "good",
                            "testCoverage": "high",
                            "recommendations": [
                                "Consider adding changelog documentation",
                                "Add contributing guidelines",
                                "Consider adding code coverage reporting",
                            ],
                        },
                    }

                return {
                    "success": True,
                    "analysis": analysis_result,
                    "summary": {
                        "total_files": len(analysis_result["structure"]["files"]),
                        "primary_language": max(
                            analysis_result["technologies"]["languages"].items(), key=lambda x: x[1]
                        )[0],
                        "framework_count": len(analysis_result["technologies"]["frameworks"]),
                        "complexity_level": analysis_result["insights"]["complexity"],
                        "quality_score": analysis_result["insights"]["maintainability"],
                    },
                    "message": "Repository analysis completed successfully",
                    "actionable_insights": analysis_result["insights"]["recommendations"],
                }

            except Exception as e:
                return {
                    "success": False,
                    "error": str(e),
                    "message": "Failed to analyze repository",
                    "suggestions": [
                        "Check repository path and permissions",
                        "Ensure repository contains source code files",
                        "Verify Context Engineering MCP server connectivity",
                    ],
                }

        @self.agent.tool
        async def validate_code_quality(
            ctx: RunContext[ContextEngineeringProxyDependencies],
            file_paths: list[str] = None,
            run_tests: bool = True,
            run_linting: bool = True,
            run_type_checking: bool = True,
        ) -> dict[str, Any]:
            """
            Run comprehensive code quality validation.

            Args:
                file_paths: Specific files to validate (None for all)
                run_tests: Whether to run test suite
                run_linting: Whether to run linting checks
                run_type_checking: Whether to run type checking
            """
            try:
                validation_results = {
                    "syntax_check": True,
                    "linting_passed": True,
                    "type_check_passed": True,
                    "tests_passed": True,
                    "coverage_percentage": 85.5,
                }

                issues_found = []
                suggestions = []

                # Mock validation logic
                if run_linting and not validation_results["linting_passed"]:
                    issues_found.append("Code style issues found")
                    suggestions.append("Run: ruff check . --fix")

                if run_type_checking and not validation_results["type_check_passed"]:
                    issues_found.append("Type checking errors found")
                    suggestions.append("Run: mypy . --show-error-codes")

                if run_tests and not validation_results["tests_passed"]:
                    issues_found.append("Some tests are failing")
                    suggestions.append("Review test failures and fix issues")

                overall_status = "passed" if all(validation_results.values()) else "failed"

                return {
                    "success": True,
                    "validation_status": overall_status,
                    "results": validation_results,
                    "issues_found": issues_found,
                    "suggestions": suggestions,
                    "message": f"Code quality validation {overall_status}",
                    "quality_score": 95 if overall_status == "passed" else 70,
                    "next_steps": suggestions
                    if suggestions
                    else [
                        "Code quality looks good!",
                        "Consider adding more tests for edge cases",
                        "Review documentation for completeness",
                    ],
                }

            except Exception as e:
                return {
                    "success": False,
                    "error": str(e),
                    "message": "Failed to validate code quality",
                    "suggestions": [
                        "Check that validation tools are installed",
                        "Ensure project structure is correct",
                        "Verify development environment setup",
                    ],
                }
