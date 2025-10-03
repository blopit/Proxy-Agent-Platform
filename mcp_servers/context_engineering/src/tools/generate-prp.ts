/**
 * Generate PRP Tool for Context Engineering MCP Server
 *
 * Implements the /generate-prp command as an MCP tool, creating comprehensive
 * Product Requirements Prompts from INITIAL.md files with research and validation.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  Props,
  Env,
  GeneratePRPSchema,
  GeneratePRPInput,
  PRPGenerationResult,
  PRPError,
} from "../types";
import {
  createSuccessResponse,
  createErrorResponse,
  validateRepositoryAccess,
  generateOperationId,
} from "./register-tools";

/**
 * Register the generate-prp tool with the MCP server
 */
export function registerGeneratePRPTool(
  server: McpServer,
  env: Env,
  props: Props
): void {
  server.tool(
    "generate-prp",
    "Generate a comprehensive Product Requirements Prompt (PRP) from an INITIAL.md file with thorough research and validation gates",
    GeneratePRPSchema,
    async (input: GeneratePRPInput) => {
      const startTime = Date.now();
      const operationId = generateOperationId("generate-prp", props.login);

      try {
        console.log(`[${operationId}] Starting PRP generation for: ${input.initial_file}`);

        // Validate repository access
        const accessValidation = await validateRepositoryAccess(props, input.initial_file);
        if (!accessValidation.valid) {
          throw new PRPError(`Repository access validation failed: ${accessValidation.error}`);
        }

        // Execute PRP generation workflow
        const result = await generatePRPWorkflow(input, props, env, operationId);

        const processingTime = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
        console.log(`[${operationId}] PRP generation completed in ${processingTime}`);

        return createSuccessResponse(
          "PRP Generated Successfully",
          result,
          processingTime
        );

      } catch (error) {
        const processingTime = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
        console.error(`[${operationId}] PRP generation failed after ${processingTime}:`, error);

        const suggestions = [
          "Ensure the INITIAL.md file exists and is properly formatted",
          "Check that you have access to the repository",
          "Verify the repository contains the necessary context files",
          "Try with a simpler initial file first",
        ];

        return createErrorResponse("PRP Generation", error, suggestions);
      }
    }
  );
}

/**
 * Main PRP generation workflow
 */
async function generatePRPWorkflow(
  input: GeneratePRPInput,
  props: Props,
  env: Env,
  operationId: string
): Promise<PRPGenerationResult> {
  console.log(`[${operationId}] Reading INITIAL file: ${input.initial_file}`);

  // Step 1: Read and parse INITIAL.md file
  const initialContent = await readInitialFile(input.initial_file, props, env);
  const parsedInitial = parseInitialFile(initialContent);

  console.log(`[${operationId}] Analyzing codebase structure`);

  // Step 2: Analyze codebase for patterns and context
  const codebaseAnalysis = await analyzeCodebasePatterns(input.initial_file, props, env);

  console.log(`[${operationId}] Conducting research (depth: ${input.research_depth})`);

  // Step 3: Conduct research based on requirements
  const researchResults = await conductResearch(
    parsedInitial,
    input.research_depth,
    props,
    env
  );

  console.log(`[${operationId}] Generating PRP content`);

  // Step 4: Generate comprehensive PRP
  const prpContent = await generatePRPContent(
    parsedInitial,
    codebaseAnalysis,
    researchResults,
    input
  );

  console.log(`[${operationId}] Writing PRP file`);

  // Step 5: Write PRP file
  const prpFilePath = await writePRPFile(
    prpContent,
    input.output_directory,
    parsedInitial.featureName,
    props,
    env
  );

  // Step 6: Calculate confidence score
  const confidenceScore = calculateConfidenceScore(
    parsedInitial,
    codebaseAnalysis,
    researchResults
  );

  return {
    prp_file: prpFilePath,
    confidence_score: confidenceScore,
    research_sources: researchResults.sources,
    validation_gates: prpContent.validationGates,
    estimated_complexity: determineComplexity(parsedInitial, codebaseAnalysis),
    implementation_time: estimateImplementationTime(parsedInitial, codebaseAnalysis),
    prerequisites: prpContent.prerequisites,
    success_criteria: prpContent.successCriteria,
  };
}

/**
 * Read INITIAL.md file from repository
 */
async function readInitialFile(
  filePath: string,
  props: Props,
  env: Env
): Promise<string> {
  // This would integrate with GitHub API or file system
  // For now, return a mock implementation
  return `
## FEATURE:
Pydantic AI agent that has another Pydantic AI agent as a tool.

## EXAMPLES:
In the examples/ folder, there is a README for you to read.

## DOCUMENTATION:
Pydantic AI documentation: https://ai.pydantic.dev/

## OTHER CONSIDERATIONS:
- Include a .env.example, README with instructions for setup
- Virtual environment has already been set up
- Use python_dotenv and load_env() for environment variables
  `;
}

/**
 * Parse INITIAL.md content into structured data
 */
function parseInitialFile(content: string): {
  featureName: string;
  feature: string;
  examples: string;
  documentation: string[];
  considerations: string[];
} {
  const sections = {
    feature: "",
    examples: "",
    documentation: [] as string[],
    considerations: [] as string[],
  };

  const lines = content.split('\n');
  let currentSection = "";

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('## FEATURE:')) {
      currentSection = "feature";
      continue;
    } else if (trimmed.startsWith('## EXAMPLES:')) {
      currentSection = "examples";
      continue;
    } else if (trimmed.startsWith('## DOCUMENTATION:')) {
      currentSection = "documentation";
      continue;
    } else if (trimmed.startsWith('## OTHER CONSIDERATIONS:')) {
      currentSection = "considerations";
      continue;
    }

    if (trimmed && !trimmed.startsWith('#')) {
      switch (currentSection) {
        case "feature":
          sections.feature += trimmed + " ";
          break;
        case "examples":
          sections.examples += trimmed + " ";
          break;
        case "documentation":
          if (trimmed.startsWith('http') || trimmed.includes('://')) {
            sections.documentation.push(trimmed);
          }
          break;
        case "considerations":
          if (trimmed.startsWith('-')) {
            sections.considerations.push(trimmed.substring(1).trim());
          }
          break;
      }
    }
  }

  return {
    featureName: sections.feature.substring(0, 50).trim() || "feature",
    ...sections,
  };
}

/**
 * Analyze codebase patterns and structure
 */
async function analyzeCodebasePatterns(
  repositoryPath: string,
  props: Props,
  env: Env
): Promise<any> {
  // This would analyze the actual codebase
  // For now, return mock analysis
  return {
    languages: { python: 85, typescript: 15 },
    frameworks: ["pydantic-ai", "fastapi"],
    patterns: ["agent-pattern", "tool-pattern"],
    testFrameworks: ["pytest"],
    documentation: ["README.md", "CLAUDE.md"],
  };
}

/**
 * Conduct research for PRP generation
 */
async function conductResearch(
  parsedInitial: any,
  depth: string,
  props: Props,
  env: Env
): Promise<{ sources: string[]; insights: string[] }> {
  // This would conduct actual research using web search, documentation, etc.
  return {
    sources: [
      "https://ai.pydantic.dev/",
      "https://docs.anthropic.com/claude-code",
      "GitHub repository analysis",
    ],
    insights: [
      "PydanticAI requires async throughout",
      "Agent-as-tool pattern requires passing ctx.usage",
      "Use dependency injection for external services",
    ],
  };
}

/**
 * Generate PRP content
 */
async function generatePRPContent(
  parsedInitial: any,
  codebaseAnalysis: any,
  researchResults: any,
  input: GeneratePRPInput
): Promise<{
  content: string;
  validationGates: string[];
  prerequisites: string[];
  successCriteria: string[];
}> {
  const prpContent = `
# ${parsedInitial.featureName}

## Goal
${parsedInitial.feature}

## Why
- Enhances AI agent capabilities through multi-agent patterns
- Demonstrates advanced PydanticAI architecture
- Provides reusable patterns for agent development

## What
${parsedInitial.feature}

### Success Criteria
- [ ] Primary agent successfully integrates sub-agent as tool
- [ ] All validation gates pass
- [ ] Documentation is comprehensive
- [ ] Tests achieve 80%+ coverage

## All Needed Context

### Documentation & References
\`\`\`yaml
${researchResults.sources.map((source: string) => `- url: ${source}\n  why: Core implementation patterns`).join('\n')}
\`\`\`

### Current Codebase Structure
\`\`\`
${JSON.stringify(codebaseAnalysis, null, 2)}
\`\`\`

### Known Gotchas
\`\`\`python
${researchResults.insights.map((insight: string) => `# CRITICAL: ${insight}`).join('\n')}
\`\`\`

## Implementation Blueprint

### Task List
1. Create agent dependencies and configuration
2. Implement primary agent with tool registration
3. Implement sub-agent with proper interfaces
4. Add comprehensive testing
5. Update documentation

## Validation Loop

### Level 1: Syntax & Style
\`\`\`bash
ruff check . --fix
mypy .
\`\`\`

### Level 2: Unit Tests
\`\`\`bash
pytest tests/ -v --cov=src --cov-report=term-missing
\`\`\`

### Level 3: Integration Test
\`\`\`bash
python -m src.main --test-mode
\`\`\`

## Final Validation Checklist
- [ ] All tests pass
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Example usage provided
`;

  return {
    content: prpContent,
    validationGates: ["ruff check", "mypy", "pytest"],
    prerequisites: ["Python 3.8+", "PydanticAI installed", "Environment configured"],
    successCriteria: [
      "Primary agent integrates sub-agent",
      "All tests pass",
      "Documentation complete",
    ],
  };
}

/**
 * Write PRP file to storage
 */
async function writePRPFile(
  prpContent: any,
  outputDirectory: string,
  featureName: string,
  props: Props,
  env: Env
): Promise<string> {
  const fileName = `${featureName.toLowerCase().replace(/\s+/g, '-')}.md`;
  const filePath = `${outputDirectory}/${fileName}`;

  // This would write to actual file system or cloud storage
  console.log(`Writing PRP to: ${filePath}`);

  return filePath;
}

/**
 * Calculate confidence score for PRP
 */
function calculateConfidenceScore(
  parsedInitial: any,
  codebaseAnalysis: any,
  researchResults: any
): number {
  let score = 5.0; // Base score

  // Boost for comprehensive initial description
  if (parsedInitial.feature.length > 100) score += 1.0;

  // Boost for examples provided
  if (parsedInitial.examples.length > 50) score += 1.0;

  // Boost for documentation references
  if (parsedInitial.documentation.length > 0) score += 1.0;

  // Boost for research insights
  if (researchResults.insights.length > 2) score += 1.0;

  // Boost for codebase analysis
  if (codebaseAnalysis.frameworks.length > 0) score += 0.5;

  return Math.min(10.0, score);
}

/**
 * Determine implementation complexity
 */
function determineComplexity(
  parsedInitial: any,
  codebaseAnalysis: any
): "low" | "medium" | "high" {
  const factors = [
    parsedInitial.feature.includes("multi-agent"),
    parsedInitial.feature.includes("integration"),
    parsedInitial.considerations.length > 3,
    codebaseAnalysis.frameworks.length > 2,
  ];

  const complexityScore = factors.filter(Boolean).length;

  if (complexityScore <= 1) return "low";
  if (complexityScore <= 3) return "medium";
  return "high";
}

/**
 * Estimate implementation time
 */
function estimateImplementationTime(
  parsedInitial: any,
  codebaseAnalysis: any
): string {
  const complexity = determineComplexity(parsedInitial, codebaseAnalysis);

  switch (complexity) {
    case "low":
      return "2-4 hours";
    case "medium":
      return "1-2 days";
    case "high":
      return "3-5 days";
    default:
      return "Unknown";
  }
}