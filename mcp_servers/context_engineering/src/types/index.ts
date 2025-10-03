/**
 * Type definitions for Context Engineering MCP Server
 */

import { z } from "zod";

/**
 * User properties from GitHub OAuth
 */
export interface Props {
  login: string;        // GitHub username
  name: string;         // Display name
  email: string;        // Email address
  accessToken: string;  // GitHub access token
}

/**
 * Cloudflare Workers environment bindings
 */
export interface Env {
  // OAuth Provider
  OAUTH_PROVIDER: any;

  // GitHub OAuth
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;

  // Storage
  SESSION_STORAGE: KVNamespace;
  FILE_STORAGE: R2Bucket;

  // Analytics
  ANALYTICS: AnalyticsEngineDataset;

  // Security
  COOKIE_ENCRYPTION_KEY: string;

  // Optional monitoring
  SENTRY_DSN?: string;
}

/**
 * Schema for generate-prp tool
 */
export const GeneratePRPSchema = z.object({
  initial_file: z.string().min(1, "INITIAL.md file path is required"),
  output_directory: z.string().default("PRPs"),
  research_depth: z.enum(["basic", "comprehensive", "extensive"]).default("comprehensive"),
  include_examples: z.boolean().default(true),
  include_validation_gates: z.boolean().default(true),
});

export type GeneratePRPInput = z.infer<typeof GeneratePRPSchema>;

/**
 * Schema for execute-prp tool
 */
export const ExecutePRPSchema = z.object({
  prp_file: z.string().min(1, "PRP file path is required"),
  dry_run: z.boolean().default(false),
  skip_tests: z.boolean().default(false),
  parallel_execution: z.boolean().default(false),
});

export type ExecutePRPInput = z.infer<typeof ExecutePRPSchema>;

/**
 * Schema for primer tool
 */
export const PrimerSchema = z.object({
  repository_path: z.string().default("."),
  include_dependencies: z.boolean().default(true),
  include_documentation: z.boolean().default(true),
  max_file_size: z.number().default(100000), // 100KB
  excluded_patterns: z.array(z.string()).default([
    "node_modules",
    ".git",
    "dist",
    "build",
    "*.log",
    "*.lock"
  ]),
});

export type PrimerInput = z.infer<typeof PrimerSchema>;

/**
 * Common response format for MCP tools
 */
export interface MCPToolResponse {
  content: Array<{
    type: "text" | "resource";
    text?: string;
    resource?: string;
    mimeType?: string;
    isError?: boolean;
  }>;
}

/**
 * Repository analysis result
 */
export interface RepositoryAnalysis {
  structure: {
    directories: string[];
    files: string[];
    totalSize: number;
  };
  technologies: {
    languages: Record<string, number>;
    frameworks: string[];
    packageManagers: string[];
  };
  documentation: {
    readme: string | null;
    changelog: string | null;
    contributing: string | null;
    license: string | null;
  };
  configuration: {
    buildTools: string[];
    testFrameworks: string[];
    linting: string[];
    cicd: string[];
  };
  dependencies: {
    production: Record<string, string>;
    development: Record<string, string>;
  };
  insights: {
    complexity: "low" | "medium" | "high";
    maintainability: "good" | "fair" | "needs-improvement";
    testCoverage: "high" | "medium" | "low" | "unknown";
    recommendations: string[];
  };
}

/**
 * PRP generation result
 */
export interface PRPGenerationResult {
  prp_file: string;
  confidence_score: number;
  research_sources: string[];
  validation_gates: string[];
  estimated_complexity: "low" | "medium" | "high";
  implementation_time: string;
  prerequisites: string[];
  success_criteria: string[];
}

/**
 * PRP execution result
 */
export interface PRPExecutionResult {
  status: "success" | "partial" | "failed";
  completed_tasks: string[];
  failed_tasks: string[];
  validation_results: {
    syntax_check: boolean;
    type_check: boolean;
    tests_passed: boolean;
    linting_passed: boolean;
  };
  files_modified: string[];
  files_created: string[];
  execution_time: string;
  next_steps: string[];
}

/**
 * Error types for Context Engineering operations
 */
export class ContextEngineeringError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = "ContextEngineeringError";
  }
}

export class PRPError extends ContextEngineeringError {
  constructor(message: string, details?: any) {
    super(message, "PRP_ERROR", details);
    this.name = "PRPError";
  }
}

export class RepositoryError extends ContextEngineeringError {
  constructor(message: string, details?: any) {
    super(message, "REPOSITORY_ERROR", details);
    this.name = "RepositoryError";
  }
}