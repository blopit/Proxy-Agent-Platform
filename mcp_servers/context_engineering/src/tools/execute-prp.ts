/**
 * Execute PRP Tool for Context Engineering MCP Server
 *
 * Implements the /execute-prp command as an MCP tool, implementing features
 * from Product Requirements Prompts with validation loops and quality gates.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  Props,
  Env,
  ExecutePRPSchema,
  ExecutePRPInput,
  PRPExecutionResult,
  PRPError,
} from "../types";
import {
  createSuccessResponse,
  createErrorResponse,
  validateRepositoryAccess,
  generateOperationId,
} from "./register-tools";

/**
 * Register the execute-prp tool with the MCP server
 */
export function registerExecutePRPTool(
  server: McpServer,
  env: Env,
  props: Props
): void {
  server.tool(
    "execute-prp",
    "Execute a Product Requirements Prompt (PRP) to implement features with validation loops and quality gates",
    ExecutePRPSchema,
    async (input: ExecutePRPInput) => {
      const startTime = Date.now();
      const operationId = generateOperationId("execute-prp", props.login);

      try {
        console.log(`[${operationId}] Starting PRP execution for: ${input.prp_file}`);

        // Validate repository access
        const accessValidation = await validateRepositoryAccess(props, input.prp_file);
        if (!accessValidation.valid) {
          throw new PRPError(`Repository access validation failed: ${accessValidation.error}`);
        }

        // Execute PRP implementation workflow
        const result = await executePRPWorkflow(input, props, env, operationId);

        const processingTime = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
        console.log(`[${operationId}] PRP execution completed in ${processingTime}`);

        return createSuccessResponse(
          "PRP Executed Successfully",
          result,
          processingTime
        );

      } catch (error) {
        const processingTime = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
        console.error(`[${operationId}] PRP execution failed after ${processingTime}:`, error);

        const suggestions = [
          "Ensure the PRP file exists and is properly formatted",
          "Check that all prerequisites are met",
          "Verify you have write access to the repository",
          "Try running with dry_run: true first",
          "Check that validation tools are available (ruff, mypy, pytest)",
        ];

        return createErrorResponse("PRP Execution", error, suggestions);
      }
    }
  );
}

/**
 * Main PRP execution workflow
 */
async function executePRPWorkflow(
  input: ExecutePRPInput,
  props: Props,
  env: Env,
  operationId: string
): Promise<PRPExecutionResult> {
  console.log(`[${operationId}] Reading PRP file: ${input.prp_file}`);

  // Step 1: Read and parse PRP file
  const prpContent = await readPRPFile(input.prp_file, props, env);
  const parsedPRP = parsePRPFile(prpContent);

  console.log(`[${operationId}] Planning implementation tasks`);

  // Step 2: Plan implementation tasks
  const implementationPlan = await planImplementation(parsedPRP, input, operationId);

  if (input.dry_run) {
    console.log(`[${operationId}] Dry run completed - no changes made`);
    return {
      status: "success",
      completed_tasks: [],
      failed_tasks: [],
      validation_results: {
        syntax_check: true,
        type_check: true,
        tests_passed: true,
        linting_passed: true,
      },
      files_modified: [],
      files_created: [],
      execution_time: "0s (dry run)",
      next_steps: implementationPlan.tasks.map(t => t.description),
    };
  }

  console.log(`[${operationId}] Executing implementation tasks`);

  // Step 3: Execute implementation
  const executionResults = await executeImplementation(
    implementationPlan,
    props,
    env,
    operationId,
    input.parallel_execution
  );

  console.log(`[${operationId}] Running validation gates`);

  // Step 4: Run validation gates
  const validationResults = input.skip_tests
    ? { syntax_check: true, type_check: true, tests_passed: true, linting_passed: true }
    : await runValidationGates(parsedPRP.validationGates, props, env, operationId);

  console.log(`[${operationId}] Determining final status`);

  // Step 5: Determine final status
  const finalStatus = determineFinalStatus(executionResults, validationResults);

  return {
    status: finalStatus,
    completed_tasks: executionResults.completedTasks,
    failed_tasks: executionResults.failedTasks,
    validation_results: validationResults,
    files_modified: executionResults.filesModified,
    files_created: executionResults.filesCreated,
    execution_time: executionResults.executionTime,
    next_steps: generateNextSteps(finalStatus, executionResults, validationResults),
  };
}

/**
 * Read PRP file from repository
 */
async function readPRPFile(
  filePath: string,
  props: Props,
  env: Env
): Promise<string> {
  // This would integrate with GitHub API or file system
  // For now, return a mock PRP
  return `
# Multi-Agent System PRP

## Goal
Build a Pydantic AI multi-agent system with research and email capabilities.

## Implementation Blueprint

### Task List
1. Create agent dependencies and configuration
2. Implement research agent with Brave Search
3. Implement email agent with Gmail integration
4. Add agent-as-tool pattern
5. Create CLI interface with streaming
6. Add comprehensive testing

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
- [ ] CLI works with streaming
`;
}

/**
 * Parse PRP file content into structured data
 */
function parsePRPFile(content: string): {
  goal: string;
  tasks: string[];
  validationGates: string[];
  successCriteria: string[];
} {
  const tasks: string[] = [];
  const validationGates: string[] = [];
  const successCriteria: string[] = [];
  let goal = "";

  const lines = content.split('\n');
  let currentSection = "";

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('## Goal')) {
      currentSection = "goal";
      continue;
    } else if (trimmed.includes('Task List') || trimmed.includes('Implementation')) {
      currentSection = "tasks";
      continue;
    } else if (trimmed.includes('Validation') || trimmed.includes('Level')) {
      currentSection = "validation";
      continue;
    } else if (trimmed.includes('Checklist') || trimmed.includes('Success Criteria')) {
      currentSection = "criteria";
      continue;
    }

    if (trimmed) {
      switch (currentSection) {
        case "goal":
          if (!trimmed.startsWith('#')) {
            goal += trimmed + " ";
          }
          break;
        case "tasks":
          if (trimmed.match(/^\d+\./)) {
            tasks.push(trimmed);
          }
          break;
        case "validation":
          if (trimmed.startsWith('ruff') || trimmed.startsWith('mypy') || trimmed.startsWith('pytest')) {
            validationGates.push(trimmed);
          }
          break;
        case "criteria":
          if (trimmed.startsWith('- [ ]')) {
            successCriteria.push(trimmed.substring(5).trim());
          }
          break;
      }
    }
  }

  return {
    goal: goal.trim(),
    tasks,
    validationGates,
    successCriteria,
  };
}

/**
 * Plan implementation based on PRP
 */
async function planImplementation(
  parsedPRP: any,
  input: ExecutePRPInput,
  operationId: string
): Promise<{ tasks: Array<{ id: string; description: string; priority: number }> }> {
  console.log(`[${operationId}] Planning ${parsedPRP.tasks.length} implementation tasks`);

  const plannedTasks = parsedPRP.tasks.map((task: string, index: number) => ({
    id: `task_${index + 1}`,
    description: task,
    priority: index + 1,
  }));

  return { tasks: plannedTasks };
}

/**
 * Execute implementation tasks
 */
async function executeImplementation(
  plan: any,
  props: Props,
  env: Env,
  operationId: string,
  parallel: boolean
): Promise<{
  completedTasks: string[];
  failedTasks: string[];
  filesModified: string[];
  filesCreated: string[];
  executionTime: string;
}> {
  const startTime = Date.now();
  const completedTasks: string[] = [];
  const failedTasks: string[] = [];
  const filesModified: string[] = [];
  const filesCreated: string[] = [];

  if (parallel) {
    console.log(`[${operationId}] Executing ${plan.tasks.length} tasks in parallel`);
    // Parallel execution would be implemented here
  } else {
    console.log(`[${operationId}] Executing ${plan.tasks.length} tasks sequentially`);

    for (const task of plan.tasks) {
      try {
        console.log(`[${operationId}] Executing task: ${task.description}`);

        // Mock task execution - in reality, this would:
        // 1. Generate code based on task description
        // 2. Create/modify files as needed
        // 3. Track changes made

        const taskResult = await executeTask(task, props, env);

        completedTasks.push(task.description);
        filesModified.push(...taskResult.modified);
        filesCreated.push(...taskResult.created);

        console.log(`[${operationId}] Task completed: ${task.description}`);
      } catch (error) {
        console.error(`[${operationId}] Task failed: ${task.description}`, error);
        failedTasks.push(task.description);
      }
    }
  }

  const executionTime = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;

  return {
    completedTasks,
    failedTasks,
    filesModified,
    filesCreated,
    executionTime,
  };
}

/**
 * Execute individual task
 */
async function executeTask(
  task: any,
  props: Props,
  env: Env
): Promise<{ modified: string[]; created: string[] }> {
  // Mock implementation - would contain actual code generation logic
  const modified: string[] = [];
  const created: string[] = [];

  if (task.description.includes("dependencies")) {
    created.push("src/config/settings.py");
    created.push("requirements.txt");
  } else if (task.description.includes("research agent")) {
    created.push("src/agents/research_agent.py");
    created.push("src/tools/brave_search.py");
  } else if (task.description.includes("email agent")) {
    created.push("src/agents/email_agent.py");
    created.push("src/tools/gmail_tool.py");
  } else if (task.description.includes("CLI")) {
    created.push("src/cli.py");
  } else if (task.description.includes("testing")) {
    created.push("tests/test_research_agent.py");
    created.push("tests/test_email_agent.py");
  }

  return { modified, created };
}

/**
 * Run validation gates
 */
async function runValidationGates(
  validationGates: string[],
  props: Props,
  env: Env,
  operationId: string
): Promise<{
  syntax_check: boolean;
  type_check: boolean;
  tests_passed: boolean;
  linting_passed: boolean;
}> {
  console.log(`[${operationId}] Running ${validationGates.length} validation gates`);

  const results = {
    syntax_check: true,
    type_check: true,
    tests_passed: true,
    linting_passed: true,
  };

  for (const gate of validationGates) {
    try {
      console.log(`[${operationId}] Running validation: ${gate}`);

      // Mock validation - would run actual commands
      if (gate.includes("ruff")) {
        results.linting_passed = await runCommand("ruff check .", operationId);
      } else if (gate.includes("mypy")) {
        results.type_check = await runCommand("mypy .", operationId);
      } else if (gate.includes("pytest")) {
        results.tests_passed = await runCommand("pytest tests/", operationId);
      }

    } catch (error) {
      console.error(`[${operationId}] Validation failed: ${gate}`, error);

      if (gate.includes("ruff")) results.linting_passed = false;
      else if (gate.includes("mypy")) results.type_check = false;
      else if (gate.includes("pytest")) results.tests_passed = false;
    }
  }

  return results;
}

/**
 * Mock command execution
 */
async function runCommand(command: string, operationId: string): Promise<boolean> {
  console.log(`[${operationId}] Running command: ${command}`);
  // Mock success - in reality would execute actual commands
  return true;
}

/**
 * Determine final execution status
 */
function determineFinalStatus(
  executionResults: any,
  validationResults: any
): "success" | "partial" | "failed" {
  const hasFailedTasks = executionResults.failedTasks.length > 0;
  const validationPassed = Object.values(validationResults).every(Boolean);

  if (!hasFailedTasks && validationPassed) {
    return "success";
  } else if (executionResults.completedTasks.length > 0) {
    return "partial";
  } else {
    return "failed";
  }
}

/**
 * Generate next steps based on execution results
 */
function generateNextSteps(
  status: string,
  executionResults: any,
  validationResults: any
): string[] {
  const nextSteps: string[] = [];

  if (status === "success") {
    nextSteps.push("All tasks completed successfully");
    nextSteps.push("Review generated code and documentation");
    nextSteps.push("Test the implementation manually");
  } else if (status === "partial") {
    if (executionResults.failedTasks.length > 0) {
      nextSteps.push(`Retry failed tasks: ${executionResults.failedTasks.join(", ")}`);
    }

    if (!validationResults.linting_passed) {
      nextSteps.push("Fix linting issues with: ruff check . --fix");
    }

    if (!validationResults.type_check) {
      nextSteps.push("Fix type checking issues with: mypy .");
    }

    if (!validationResults.tests_passed) {
      nextSteps.push("Fix failing tests or update test expectations");
    }
  } else {
    nextSteps.push("Review error logs and fix underlying issues");
    nextSteps.push("Check prerequisites and environment setup");
    nextSteps.push("Consider running with dry_run: true first");
  }

  return nextSteps;
}