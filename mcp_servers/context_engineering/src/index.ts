/**
 * Context Engineering MCP Server
 *
 * Provides Context Engineering tools as MCP server:
 * - /generate-prp: Create comprehensive implementation blueprints
 * - /execute-prp: Implement features from blueprints
 * - /primer: Repository analysis and context gathering
 *
 * Based on the existing Context Engineering patterns from .claude/commands/
 */

import { McpAgent, McpServer } from "workers-mcp";
import { Hono } from "hono";
import { Octokit } from "octokit";

import { registerContextEngineeringTools } from "./tools/register-tools";
import { Props, Env } from "./types";
import { setupGitHubOAuth } from "./utils/github-oauth";

/**
 * Context Engineering MCP Agent
 *
 * Provides the core Context Engineering workflow as MCP tools that users
 * can install in their Claude Code setup via:
 * npx mcp-remote https://your-domain.workers.dev/mcp
 */
export class ContextEngineeringMCP extends McpAgent<Env, Record<string, never>, Props> {
  server = new McpServer({
    name: "Context Engineering MCP Server",
    version: "0.1.0",
    description: "Provides Context Engineering tools for AI-assisted development workflows",
  });

  async init() {
    // Verify user authentication
    if (!this.props.login) {
      throw new Error("GitHub authentication required for Context Engineering tools");
    }

    console.log(`Context Engineering MCP initialized for user: ${this.props.login}`);

    // Register all Context Engineering tools
    registerContextEngineeringTools(this.server, this.env, this.props);

    console.log("Context Engineering tools registered successfully");
  }

  /**
   * Health check endpoint for monitoring
   */
  async healthCheck(): Promise<{ status: string; user: string; timestamp: string }> {
    return {
      status: "healthy",
      user: this.props.login || "anonymous",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Main Hono app with OAuth integration
 */
const app = new Hono<{ Bindings: Env }>();

// Setup GitHub OAuth flow
setupGitHubOAuth(app);

// Health check endpoint
app.get("/health", async (c) => {
  return c.json({
    status: "healthy",
    service: "Context Engineering MCP Server",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
  });
});

// MCP endpoint
app.all("/mcp", async (c) => {
  return ContextEngineeringMCP.handle(c.req.raw, c.env);
});

// SSE endpoint for real-time streaming
app.all("/sse", async (c) => {
  return ContextEngineeringMCP.handleSSE(c.req.raw, c.env);
});

// Root endpoint with instructions
app.get("/", async (c) => {
  const baseUrl = new URL(c.req.url).origin;

  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Context Engineering MCP Server</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .endpoint { background: #f3f4f6; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .code { background: #1f2937; color: #f9fafb; padding: 15px; border-radius: 6px; overflow-x: auto; }
        .status { color: #059669; font-weight: 600; }
        .tools { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
        .tool { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Context Engineering MCP Server</h1>
        <p>Transform your AI development workflow with comprehensive Context Engineering tools.</p>

        <div class="endpoint">
          <strong>Status:</strong> <span class="status">✅ Online</span><br>
          <strong>Version:</strong> 0.1.0<br>
          <strong>Authenticated User:</strong> Ready for GitHub OAuth
        </div>

        <h2>🔧 Available Tools</h2>
        <div class="tools">
          <div class="tool">
            <h3>📋 generate-prp</h3>
            <p>Create comprehensive Product Requirements Prompts from INITIAL.md files with research and validation.</p>
          </div>
          <div class="tool">
            <h3>⚡ execute-prp</h3>
            <p>Implement features from PRPs with validation loops and quality gates.</p>
          </div>
          <div class="tool">
            <h3>🔍 primer</h3>
            <p>Analyze repository structure and provide comprehensive context for AI assistants.</p>
          </div>
        </div>

        <h2>📦 Installation</h2>
        <p>Add this MCP server to your Claude Desktop configuration:</p>

        <div class="code">
{
  "mcpServers": {
    "context-engineering": {
      "command": "npx",
      "args": ["mcp-remote", "${baseUrl}/mcp"],
      "env": {}
    }
  }
}
        </div>

        <h2>🔗 Endpoints</h2>
        <div class="endpoint">
          <strong>MCP Protocol:</strong> <code>${baseUrl}/mcp</code><br>
          <strong>Server-Sent Events:</strong> <code>${baseUrl}/sse</code><br>
          <strong>Health Check:</strong> <code>${baseUrl}/health</code><br>
          <strong>OAuth Authorization:</strong> <code>${baseUrl}/authorize</code>
        </div>

        <h2>🔐 Authentication</h2>
        <p>This server requires GitHub OAuth for secure access to your repositories. The first time you use it, you'll be redirected to GitHub for authorization.</p>

        <h2>📚 Documentation</h2>
        <p>Learn more about Context Engineering at <a href="https://github.com/yourusername/proxy-agent-platform">the GitHub repository</a>.</p>
      </div>
    </body>
    </html>
  `);
});

export default app;