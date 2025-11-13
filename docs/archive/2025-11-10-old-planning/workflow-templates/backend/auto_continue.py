#!/usr/bin/env python3
"""
Backend Auto-Continue Script - Intelligent TDD-driven backend completion
Automatically determines current state and executes next required backend task
"""

import subprocess
from pathlib import Path


def check_current_state():
    """Determine current backend development state"""
    print("🔍 Analyzing current backend state...")

    # Check test status
    try:
        test_result = subprocess.run(
            ["uv", "run", "pytest", "src/", "--tb=no", "-q"],
            capture_output=True,
            text=True,
            cwd=Path.cwd(),
        )

        print(f"📊 Test output: {test_result.stdout[:200]}...")

        if "failed" in test_result.stdout.lower():
            # Extract number of failing tests
            lines = test_result.stdout.split("\n")
            failed_count = None
            for line in lines:
                if "failed" in line.lower():
                    parts = line.split()
                    for i, part in enumerate(parts):
                        if "failed" in part.lower() and i > 0:
                            failed_count = parts[i - 1]
                            break
                    break

            print(
                f"🔥 STATE: BACKEND_INTEGRATION_ISSUES - {failed_count or 'Multiple'} tests failing"
            )
            return "INTEGRATION_ISSUES", failed_count

        # Check if authentication exists
        elif not any(Path("src/api").glob("*auth*")):
            print("🔐 STATE: AUTHENTICATION_MISSING")
            return "AUTHENTICATION_MISSING", None

        # Check if AI logic exists
        elif not Path("src/agents/task_proxy_intelligent.py").exists():
            print("🧠 STATE: AI_LOGIC_MISSING")
            return "AI_LOGIC_MISSING", None

        else:
            print("⚡ STATE: BACKEND_ADVANCED_FEATURES")
            return "ADVANCED_FEATURES", None

    except Exception as e:
        print(f"❌ Error checking state: {e}")
        return "ERROR", str(e)


def execute_epic_1_1():
    """Execute Epic 1.1: API Integration Stabilization"""
    print("\n🚀 EXECUTING EPIC 1.1: API Integration Stabilization")
    print("=" * 60)

    print("📋 Phase 1: Analyze failing tests in detail")

    # Run tests with detailed output
    subprocess.run(["uv", "run", "pytest", "src/api/tests/", "-v", "--tb=short"], cwd=Path.cwd())

    print("\n📋 Phase 2: Fix API endpoint integration issues")
    print("💡 Key areas to address:")
    print("  1. Foreign key constraint errors")
    print("  2. Repository-to-API integration")
    print("  3. Request/response model alignment")
    print("  4. Error handling improvements")

    print("\n📋 Phase 3: TDD Approach for fixes")
    print("  🔴 RED: Keep failing tests as specification")
    print("  🟢 GREEN: Fix minimum code to pass tests")
    print("  🔵 REFACTOR: Improve code quality")

    print("\n🎯 Success Criteria:")
    print("  ✅ All 182 tests passing")
    print("  ✅ API endpoints returning consistent data")
    print("  ✅ Foreign key relationships working")
    print("  ✅ Error responses properly structured")

    print("\n💻 Next Steps:")
    print("  1. Focus on simple-tasks API (already working)")
    print("  2. Fix complex task API endpoints")
    print("  3. Resolve foreign key issues")
    print("  4. Test all endpoints manually")

    return True


def execute_epic_1_2():
    """Execute Epic 1.2: Authentication System"""
    print("\n🔐 EXECUTING EPIC 1.2: Authentication System")
    print("=" * 60)

    print("📋 TDD Implementation Plan:")
    print("  1. Write user authentication tests first")
    print("  2. Implement JWT token system")
    print("  3. Add user registration/login endpoints")
    print("  4. Secure existing API endpoints")

    return True


def execute_epic_2_1():
    """Execute Epic 2.1: AI Intelligence"""
    print("\n🧠 EXECUTING EPIC 2.1: Task Proxy Intelligence")
    print("=" * 60)

    print("📋 AI Development Plan:")
    print("  1. Write task intelligence tests")
    print("  2. Implement OpenAI/Anthropic integration")
    print("  3. Add context-aware task suggestions")
    print("  4. Create learning algorithms")

    return True


def execute_epic_3():
    """Execute Epic 3: Advanced Features"""
    print("\n⚡ EXECUTING EPIC 3: Advanced Backend Features")
    print("=" * 60)

    print("📋 Advanced Features Plan:")
    print("  1. Real-time WebSocket implementation")
    print("  2. Redis caching layer")
    print("  3. Background job processing")
    print("  4. Performance optimization")

    return True


def main():
    """Main execution function"""
    print("🎯 BACKEND AUTO-CONTINUE - TDD-DRIVEN DEVELOPMENT")
    print("=" * 60)
    print("🔧 Foundation: Working simple-tasks API + 161/182 tests passing")
    print("🎯 Goal: Complete backend infrastructure using TDD methodology")
    print()

    # Check current state
    state, details = check_current_state()

    # Execute appropriate epic based on state
    if state == "INTEGRATION_ISSUES":
        success = execute_epic_1_1()
    elif state == "AUTHENTICATION_MISSING":
        success = execute_epic_1_2()
    elif state == "AI_LOGIC_MISSING":
        success = execute_epic_2_1()
    elif state == "ADVANCED_FEATURES":
        success = execute_epic_3()
    else:
        print(f"❌ Unknown state: {state}")
        return False

    if success:
        print("\n✅ Epic execution guidance provided!")
        print("📝 Use TodoWrite to track progress")
        print("🧪 Follow TDD methodology (Red-Green-Refactor)")
        print("🎯 Run tests frequently to validate progress")
        print("\n💡 Re-run this script after completing current epic!")

    return success


if __name__ == "__main__":
    main()
