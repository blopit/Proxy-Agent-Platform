# 📦 Examples Directory

This directory contains example implementations, templates, and reference code for common development patterns in the Proxy Agent Platform.

## Overview

These examples demonstrate how to build various components and integrations using the platform's architecture and best practices.

## Structure

```
examples/
├── agent-factory-with-subagents/    # Multi-agent system with RAG
├── ai-coding-workflows-foundation/  # AI-assisted coding workflows
├── mcp-server/                      # Model Context Protocol server
├── pydantic-ai/                     # Pydantic AI agent examples
└── template-generator/              # Template generation system
```

## Examples

### 🤖 Agent Factory with Subagents
**Path**: `agent-factory-with-subagents/`

A comprehensive example of building a multi-agent system with subagents and RAG (Retrieval-Augmented Generation) capabilities.

**Features**:
- Parent-child agent architecture
- RAG pipeline implementation
- Document processing and indexing
- Query handling with context

**Use Cases**:
- Building hierarchical agent systems
- Implementing RAG for knowledge bases
- Document-based question answering

**Quick Start**:
```bash
cd examples/agent-factory-with-subagents
cat README.md
```

### 🔧 AI Coding Workflows Foundation
**Path**: `ai-coding-workflows-foundation/`

Foundation for AI-assisted coding workflows, including code analysis and validation.

**Features**:
- Codebase analysis agents
- Validation workflows
- Plan creation and execution
- Primer system for context

**Use Cases**:
- Automated code review
- Refactoring assistance
- Documentation generation

**Quick Start**:
```bash
cd examples/ai-coding-workflows-foundation
cat README.md
```

### 🔌 MCP Server
**Path**: `mcp-server/`

Example implementation of a Model Context Protocol (MCP) server for AI model integration.

**Features**:
- MCP protocol implementation
- Claude API integration
- Custom prompt templates
- PRP (Prompt-Response Pattern) system

**Use Cases**:
- Building custom MCP servers
- Integrating with Claude API
- Creating reusable prompt patterns

**Quick Start**:
```bash
cd examples/mcp-server
cat README.md
```

### 🐍 Pydantic AI
**Path**: `pydantic-ai/`

Examples using Pydantic AI for type-safe agent development.

**Features**:
- Type-safe agent definitions
- Pydantic model integration
- Tool definitions
- Response validation

**Use Cases**:
- Building robust AI agents
- Type-safe LLM interactions
- Structured output handling

**Quick Start**:
```bash
cd examples/pydantic-ai
cat README.md
```

### 📝 Template Generator
**Path**: `template-generator/`

System for generating project templates and boilerplate code.

**Features**:
- Template creation
- Variable substitution
- PRP template generation
- Code scaffolding

**Use Cases**:
- Creating new agents quickly
- Standardizing project structure
- Generating boilerplate code

**Quick Start**:
```bash
cd examples/template-generator
cat README.md
```

## Using Examples

### Learning Path

1. **Start with**: `pydantic-ai/` - Learn basic agent structure
2. **Then**: `mcp-server/` - Understand MCP integration
3. **Next**: `ai-coding-workflows-foundation/` - See practical workflows
4. **Advanced**: `agent-factory-with-subagents/` - Build complex systems
5. **Productivity**: `template-generator/` - Speed up development

### Adapting Examples

All examples follow the same pattern:

```
example-name/
├── README.md              # Overview and quick start
├── CLAUDE.md             # Claude Code specific instructions
├── PRPs/                 # Prompt-Response Patterns
│   ├── INITIAL.md        # Initial setup prompt
│   └── templates/        # Reusable prompt templates
├── agents/               # Agent implementations
├── examples/             # Usage examples
└── tests/                # Test cases
```

### Best Practices

1. **Read README First**: Every example has comprehensive documentation
2. **Check PRPs**: Prompt patterns show how to use the code
3. **Run Tests**: Validate your understanding
4. **Adapt, Don't Copy**: Understand the patterns, then adapt to your needs
5. **Follow CLAUDE.md**: Each example follows project standards

## Integration with Main Project

### Copying Examples

```bash
# Copy entire example
cp -r examples/pydantic-ai/agents/example_agent src/agents/my_agent

# Copy specific patterns
cp examples/mcp-server/PRPs/templates/prp_mcp_base.md .claude/prps/
```

### Referencing Examples

Examples are referenced in:
- Main [docs/INDEX.md](../docs/INDEX.md)
- [CLAUDE.md](../CLAUDE.md) development guide
- Task specifications in [docs/tasks/](../docs/tasks/)

## Contributing Examples

### Adding New Examples

1. Create directory: `examples/new-example/`
2. Add README.md with:
   - Overview
   - Features
   - Use cases
   - Quick start
   - Code examples
3. Follow project structure:
   - CLAUDE.md for standards
   - PRPs/ for prompts
   - agents/ for implementations
   - tests/ for validation
4. Update this README.md
5. Update [docs/INDEX.md](../docs/INDEX.md)

### Example Criteria

Good examples should:
- ✅ Demonstrate a clear pattern or concept
- ✅ Be self-contained and runnable
- ✅ Include comprehensive documentation
- ✅ Follow project coding standards
- ✅ Have test cases
- ✅ Be reusable in different contexts

## Common Patterns

### Agent Pattern
```python
from pydantic_ai import Agent

agent = Agent(
    'openai:gpt-4',
    system_prompt='You are a helpful assistant'
)

@agent.tool
def example_tool(ctx: Context, param: str) -> str:
    """Tool description"""
    return f"Result: {param}"
```

### MCP Server Pattern
```python
from mcp.server import Server

server = Server("example-server")

@server.tool()
def example_tool(param: str) -> str:
    """Tool description"""
    return f"Result: {param}"
```

### RAG Pattern
```python
from embeddings import get_embeddings
from vector_store import VectorStore

# Index documents
docs = load_documents()
embeddings = get_embeddings(docs)
store = VectorStore(embeddings)

# Query with context
query = "What is..."
context = store.search(query, top_k=5)
response = agent.run(query, context=context)
```

## Resources

### Documentation
- [Agent Development Guide](../docs/guides/AGENT_DEVELOPMENT_ENTRY_POINT.md)
- [API Documentation](../docs/api/)
- [Architecture Overview](../docs/architecture/)

### External Resources
- [Pydantic AI Docs](https://ai.pydantic.dev/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [OpenAI API](https://platform.openai.com/docs)
- [Anthropic Claude](https://docs.anthropic.com/)

## Maintenance

Examples are maintained by:
- Regular updates for API changes
- Test suite validation
- Documentation accuracy checks
- Community contributions

**Last Updated**: November 6, 2025

---

**Navigation**: [↑ Project Root](../) | [📚 Documentation](../docs/INDEX.md) | [🎯 Start Coding](../START_HERE.md)

*Need a specific example? Check [docs/guides/](../docs/guides/) or ask the team!*
