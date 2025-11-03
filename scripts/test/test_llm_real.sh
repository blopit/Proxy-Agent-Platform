#!/bin/bash
# Change to project root
cd "$(dirname "$0")/../.."
# Real LLM Integration Test Runner
# Uses gpt-4o-mini for cost-effective testing

echo "🧪 Running LLM Integration Tests with gpt-4o-mini"
echo "=================================================="
echo ""

# Check for API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY not set"
    echo "   Please set your OpenAI API key:"
    echo "   export OPENAI_API_KEY='your-key-here'"
    exit 1
fi

# Set model to gpt-4o-mini (cost-effective)
export LLM_MODEL="gpt-4o-mini"
export LLM_PROVIDER="openai"

# Enable integration tests
export RUN_INTEGRATION_TESTS=1

echo "📋 Configuration:"
echo "   Model: $LLM_MODEL"
echo "   Provider: $LLM_PROVIDER"
echo ""

# Run tests with verbose output
.venv/bin/python -m pytest \
    src/services/tests/test_llm_capture_real.py \
    -v \
    --tb=short \
    -s \
    "$@"

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo "✅ All integration tests passed!"
else
    echo ""
    echo "❌ Some tests failed (exit code: $exit_code)"
fi

exit $exit_code
