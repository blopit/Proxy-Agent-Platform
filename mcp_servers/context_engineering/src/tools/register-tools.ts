/**
 * Tool registration for Context Engineering MCP Server
 *
 * Centralizes registration of all Context Engineering tools following
 * the patterns from .claude/commands/ but adapted for MCP protocol.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Props, Env } from "../types";

import { registerGeneratePRPTool } from "./generate-prp";
import { registerExecutePRPTool } from "./execute-prp";
import { registerPrimerTool } from "./primer";

/**
 * Register all Context Engineering tools with the MCP server
 *
 * @param server - MCP server instance
 * @param env - Cloudflare Workers environment
 * @param props - User properties from GitHub OAuth
 */
export function registerContextEngineeringTools(
  server: McpServer,
  env: Env,
  props: Props
): void {
  console.log(`Registering Context Engineering tools for user: ${props.login}`);

  try {
    // Register core Context Engineering tools
    registerGeneratePRPTool(server, env, props);
    registerExecutePRPTool(server, env, props);
    registerPrimerTool(server, env, props);

    console.log("All Context Engineering tools registered successfully");
  } catch (error) {
    console.error("Failed to register Context Engineering tools:", error);
    throw new Error(`Tool registration failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get user permissions for Context Engineering operations
 *
 * @param props - User properties
 * @returns Object indicating user permissions
 */
export function getUserPermissions(props: Props): {
  canGeneratePRP: boolean;
  canExecutePRP: boolean;
  canAnalyzeRepository: boolean;
  canAccessPrivateRepos: boolean;
} {
  // Basic permissions for all authenticated users
  const basicPermissions = {
    canGeneratePRP: true,
    canExecutePRP: true,
    canAnalyzeRepository: true,
    canAccessPrivateRepos: false,
  };

  // Enhanced permissions for specific users or organizations
  const enhancedUsers = new Set([
    "coleam00",
    // Add more usernames as needed
  ]);

  if (enhancedUsers.has(props.login)) {
    return {
      ...basicPermissions,
      canAccessPrivateRepos: true,
    };
  }

  return basicPermissions;
}

/**
 * Create standardized MCP tool response
 *
 * @param content - Response content
 * @param isError - Whether this is an error response
 * @returns Formatted MCP response
 */
export function createMCPResponse(content: string, isError: boolean = false): any {
  return {
    content: [
      {
        type: "text",
        text: content,
        isError,
      },
    ],
  };
}

/**
 * Create success response with structured data
 *
 * @param title - Response title
 * @param data - Response data
 * @param processingTime - Time taken for operation
 * @returns Formatted success response
 */
export function createSuccessResponse(
  title: string,
  data: any,
  processingTime?: string
): any {
  const timeText = processingTime ? `\n\n**Processing time:** ${processingTime}` : "";

  return createMCPResponse(
    `**${title}**\n\n` +
    `**Result:**\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`` +
    timeText
  );
}

/**
 * Create error response with details
 *
 * @param operation - Operation that failed
 * @param error - Error details
 * @param suggestions - Optional suggestions for resolution
 * @returns Formatted error response
 */
export function createErrorResponse(
  operation: string,
  error: string | Error,
  suggestions?: string[]
): any {
  const errorMessage = error instanceof Error ? error.message : String(error);
  let response = `**Error in ${operation}**\n\n${errorMessage}`;

  if (suggestions && suggestions.length > 0) {
    response += `\n\n**Suggestions:**\n${suggestions.map(s => `- ${s}`).join('\n')}`;
  }

  return createMCPResponse(response, true);
}

/**
 * Validate GitHub repository access
 *
 * @param props - User properties
 * @param repoPath - Repository path to validate
 * @returns Promise resolving to validation result
 */
export async function validateRepositoryAccess(
  props: Props,
  repoPath: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Basic validation for now - can be enhanced with actual GitHub API calls
    if (!repoPath || repoPath.trim() === "") {
      return { valid: false, error: "Repository path cannot be empty" };
    }

    // Check if path looks like a valid repository path
    if (repoPath.includes("..") || repoPath.includes("//")) {
      return { valid: false, error: "Invalid repository path format" };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Repository validation failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Format file size for human readability
 *
 * @param bytes - Size in bytes
 * @returns Human-readable size string
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}

/**
 * Generate unique operation ID for tracking
 *
 * @param operation - Operation name
 * @param user - Username
 * @returns Unique operation ID
 */
export function generateOperationId(operation: string, user: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${operation}_${user}_${timestamp}_${random}`;
}