/**
 * Primer Tool for Context Engineering MCP Server
 *
 * Implements the /primer command as an MCP tool, analyzing repository
 * structure and providing comprehensive context for AI assistants.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  Props,
  Env,
  PrimerSchema,
  PrimerInput,
  RepositoryAnalysis,
  RepositoryError,
} from "../types";
import {
  createSuccessResponse,
  createErrorResponse,
  validateRepositoryAccess,
  generateOperationId,
  formatFileSize,
} from "./register-tools";

/**
 * Register the primer tool with the MCP server
 */
export function registerPrimerTool(
  server: McpServer,
  env: Env,
  props: Props
): void {
  server.tool(
    "primer",
    "Analyze repository structure and provide comprehensive context for AI assistants, including technology detection, architecture analysis, and development recommendations",
    PrimerSchema,
    async (input: PrimerInput) => {
      const startTime = Date.now();
      const operationId = generateOperationId("primer", props.login);

      try {
        console.log(`[${operationId}] Starting repository analysis for: ${input.repository_path}`);

        // Validate repository access
        const accessValidation = await validateRepositoryAccess(props, input.repository_path);
        if (!accessValidation.valid) {
          throw new RepositoryError(`Repository access validation failed: ${accessValidation.error}`);
        }

        // Execute repository analysis workflow
        const analysis = await analyzeRepositoryWorkflow(input, props, env, operationId);

        const processingTime = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
        console.log(`[${operationId}] Repository analysis completed in ${processingTime}`);

        // Format the analysis into a comprehensive report
        const report = formatAnalysisReport(analysis, input);

        return createSuccessResponse(
          "Repository Analysis Complete",
          { analysis, report },
          processingTime
        );

      } catch (error) {
        const processingTime = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
        console.error(`[${operationId}] Repository analysis failed after ${processingTime}:`, error);

        const suggestions = [
          "Ensure the repository path exists and is accessible",
          "Check that you have read access to the repository",
          "Verify the repository contains source code files",
          "Try with a smaller max_file_size if hitting limits",
        ];

        return createErrorResponse("Repository Analysis", error, suggestions);
      }
    }
  );
}

/**
 * Main repository analysis workflow
 */
async function analyzeRepositoryWorkflow(
  input: PrimerInput,
  props: Props,
  env: Env,
  operationId: string
): Promise<RepositoryAnalysis> {
  console.log(`[${operationId}] Scanning repository structure`);

  // Step 1: Scan repository structure
  const structure = await scanRepositoryStructure(input, operationId);

  console.log(`[${operationId}] Detecting technologies and frameworks`);

  // Step 2: Detect technologies and frameworks
  const technologies = await detectTechnologies(structure, input, operationId);

  console.log(`[${operationId}] Analyzing documentation`);

  // Step 3: Analyze documentation
  const documentation = await analyzeDocumentation(structure, input, operationId);

  console.log(`[${operationId}] Detecting configuration and tooling`);

  // Step 4: Detect configuration and tooling
  const configuration = await detectConfiguration(structure, input, operationId);

  console.log(`[${operationId}] Analyzing dependencies`);

  // Step 5: Analyze dependencies
  const dependencies = await analyzeDependencies(structure, input, operationId);

  console.log(`[${operationId}] Generating insights and recommendations`);

  // Step 6: Generate insights and recommendations
  const insights = generateInsights(structure, technologies, configuration, dependencies);

  return {
    structure,
    technologies,
    documentation,
    configuration,
    dependencies,
    insights,
  };
}

/**
 * Scan repository structure
 */
async function scanRepositoryStructure(
  input: PrimerInput,
  operationId: string
): Promise<RepositoryAnalysis['structure']> {
  console.log(`[${operationId}] Scanning files and directories`);

  // Mock implementation - would use actual file system or Git API
  const mockFiles = [
    "README.md",
    "package.json",
    "pyproject.toml",
    "CLAUDE.md",
    "src/main.py",
    "src/agents/research_agent.py",
    "src/agents/email_agent.py",
    "src/tools/brave_search.py",
    "src/tools/gmail_tool.py",
    "tests/test_agents.py",
    "tests/conftest.py",
    ".env.example",
    ".gitignore",
    "requirements.txt",
  ];

  const mockDirectories = [
    "src",
    "src/agents",
    "src/tools",
    "tests",
    "docs",
    ".git",
    "__pycache__",
  ];

  // Filter out excluded patterns
  const filteredFiles = mockFiles.filter(file =>
    !input.excluded_patterns.some(pattern =>
      file.includes(pattern) || new RegExp(pattern.replace(/\*/g, '.*')).test(file)
    )
  );

  const filteredDirectories = mockDirectories.filter(dir =>
    !input.excluded_patterns.some(pattern =>
      dir.includes(pattern) || new RegExp(pattern.replace(/\*/g, '.*')).test(dir)
    )
  );

  return {
    directories: filteredDirectories,
    files: filteredFiles,
    totalSize: 1024 * 1024, // 1MB mock
  };
}

/**
 * Detect technologies and frameworks
 */
async function detectTechnologies(
  structure: RepositoryAnalysis['structure'],
  input: PrimerInput,
  operationId: string
): Promise<RepositoryAnalysis['technologies']> {
  console.log(`[${operationId}] Analyzing file extensions and content`);

  const languages: Record<string, number> = {};
  const frameworks: string[] = [];
  const packageManagers: string[] = [];

  // Analyze file extensions for language detection
  for (const file of structure.files) {
    const extension = file.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'py':
        languages.python = (languages.python || 0) + 1;
        break;
      case 'js':
      case 'jsx':
        languages.javascript = (languages.javascript || 0) + 1;
        break;
      case 'ts':
      case 'tsx':
        languages.typescript = (languages.typescript || 0) + 1;
        break;
      case 'go':
        languages.go = (languages.go || 0) + 1;
        break;
      case 'rs':
        languages.rust = (languages.rust || 0) + 1;
        break;
      case 'java':
        languages.java = (languages.java || 0) + 1;
        break;
    }
  }

  // Detect package managers
  if (structure.files.includes('package.json')) {
    packageManagers.push('npm');
  }
  if (structure.files.includes('pyproject.toml') || structure.files.includes('requirements.txt')) {
    packageManagers.push('pip');
  }
  if (structure.files.includes('Cargo.toml')) {
    packageManagers.push('cargo');
  }
  if (structure.files.includes('go.mod')) {
    packageManagers.push('go mod');
  }

  // Detect frameworks based on files and structure
  if (structure.files.some(f => f.includes('pydantic') || f.includes('fastapi'))) {
    frameworks.push('FastAPI', 'Pydantic');
  }
  if (structure.files.some(f => f.includes('agent'))) {
    frameworks.push('PydanticAI');
  }
  if (structure.files.includes('package.json')) {
    frameworks.push('Node.js');
  }
  if (structure.files.some(f => f.includes('react') || f.includes('jsx'))) {
    frameworks.push('React');
  }
  if (structure.files.some(f => f.includes('next'))) {
    frameworks.push('Next.js');
  }

  return {
    languages,
    frameworks,
    packageManagers,
  };
}

/**
 * Analyze documentation
 */
async function analyzeDocumentation(
  structure: RepositoryAnalysis['structure'],
  input: PrimerInput,
  operationId: string
): Promise<RepositoryAnalysis['documentation']> {
  console.log(`[${operationId}] Checking for documentation files`);

  const documentation = {
    readme: null as string | null,
    changelog: null as string | null,
    contributing: null as string | null,
    license: null as string | null,
  };

  // Check for common documentation files
  for (const file of structure.files) {
    const lowerFile = file.toLowerCase();

    if (lowerFile.includes('readme')) {
      documentation.readme = file;
    } else if (lowerFile.includes('changelog') || lowerFile.includes('history')) {
      documentation.changelog = file;
    } else if (lowerFile.includes('contributing')) {
      documentation.contributing = file;
    } else if (lowerFile.includes('license')) {
      documentation.license = file;
    }
  }

  return documentation;
}

/**
 * Detect configuration and tooling
 */
async function detectConfiguration(
  structure: RepositoryAnalysis['structure'],
  input: PrimerInput,
  operationId: string
): Promise<RepositoryAnalysis['configuration']> {
  console.log(`[${operationId}] Detecting build tools and configuration`);

  const buildTools: string[] = [];
  const testFrameworks: string[] = [];
  const linting: string[] = [];
  const cicd: string[] = [];

  for (const file of structure.files) {
    const lowerFile = file.toLowerCase();

    // Build tools
    if (lowerFile.includes('webpack') || lowerFile.includes('vite') || lowerFile.includes('rollup')) {
      buildTools.push('Modern bundler');
    }
    if (lowerFile.includes('dockerfile')) {
      buildTools.push('Docker');
    }
    if (lowerFile.includes('makefile')) {
      buildTools.push('Make');
    }

    // Test frameworks
    if (lowerFile.includes('jest') || lowerFile.includes('vitest')) {
      testFrameworks.push('Jest/Vitest');
    }
    if (lowerFile.includes('pytest') || file.includes('conftest.py')) {
      testFrameworks.push('pytest');
    }
    if (lowerFile.includes('mocha') || lowerFile.includes('chai')) {
      testFrameworks.push('Mocha/Chai');
    }

    // Linting
    if (lowerFile.includes('eslint')) {
      linting.push('ESLint');
    }
    if (lowerFile.includes('ruff') || lowerFile.includes('black')) {
      linting.push('Ruff/Black');
    }
    if (lowerFile.includes('prettier')) {
      linting.push('Prettier');
    }

    // CI/CD
    if (lowerFile.includes('.github/workflows') || lowerFile.includes('github-actions')) {
      cicd.push('GitHub Actions');
    }
    if (lowerFile.includes('.gitlab-ci')) {
      cicd.push('GitLab CI');
    }
    if (lowerFile.includes('jenkins')) {
      cicd.push('Jenkins');
    }
  }

  return {
    buildTools,
    testFrameworks,
    linting,
    cicd,
  };
}

/**
 * Analyze dependencies
 */
async function analyzeDependencies(
  structure: RepositoryAnalysis['structure'],
  input: PrimerInput,
  operationId: string
): Promise<RepositoryAnalysis['dependencies']> {
  console.log(`[${operationId}] Analyzing project dependencies`);

  const production: Record<string, string> = {};
  const development: Record<string, string> = {};

  // Mock dependency analysis - would parse actual package files
  if (structure.files.includes('pyproject.toml')) {
    production['pydantic-ai'] = '^0.0.14';
    production['fastapi'] = '^0.104.0';
    production['uvicorn'] = '^0.24.0';

    development['pytest'] = '^7.0.0';
    development['ruff'] = '^0.1.0';
    development['mypy'] = '^1.6.0';
  }

  if (structure.files.includes('package.json')) {
    production['react'] = '^18.0.0';
    production['next'] = '^14.0.0';

    development['typescript'] = '^5.0.0';
    development['eslint'] = '^8.0.0';
  }

  return {
    production,
    development,
  };
}

/**
 * Generate insights and recommendations
 */
function generateInsights(
  structure: any,
  technologies: any,
  configuration: any,
  dependencies: any
): RepositoryAnalysis['insights'] {
  const recommendations: string[] = [];
  let complexity: "low" | "medium" | "high" = "low";
  let maintainability: "good" | "fair" | "needs-improvement" = "good";
  let testCoverage: "high" | "medium" | "low" | "unknown" = "unknown";

  // Complexity assessment
  const fileCount = structure.files.length;
  const languageCount = Object.keys(technologies.languages).length;

  if (fileCount > 100 || languageCount > 2) {
    complexity = "high";
  } else if (fileCount > 20 || languageCount > 1) {
    complexity = "medium";
  }

  // Maintainability assessment
  const hasLinting = configuration.linting.length > 0;
  const hasTests = configuration.testFrameworks.length > 0;
  const hasDocumentation = structure.files.some((f: string) => f.toLowerCase().includes('readme'));

  if (!hasLinting || !hasTests || !hasDocumentation) {
    maintainability = "needs-improvement";
    if (!hasLinting) {
      recommendations.push("Add code linting tools (ESLint, Ruff, etc.)");
    }
    if (!hasTests) {
      recommendations.push("Add comprehensive test suite");
    }
    if (!hasDocumentation) {
      recommendations.push("Add README.md with setup instructions");
    }
  } else if (hasLinting && hasTests && hasDocumentation) {
    maintainability = "good";
  } else {
    maintainability = "fair";
  }

  // Test coverage assessment
  if (hasTests) {
    const testFileCount = structure.files.filter((f: string) => f.includes('test')).length;
    const sourceFileCount = structure.files.filter((f: string) =>
      f.endsWith('.py') || f.endsWith('.js') || f.endsWith('.ts')
    ).length;

    if (testFileCount > sourceFileCount * 0.8) {
      testCoverage = "high";
    } else if (testFileCount > sourceFileCount * 0.4) {
      testCoverage = "medium";
    } else {
      testCoverage = "low";
      recommendations.push("Increase test coverage to at least 80%");
    }
  } else {
    testCoverage = "unknown";
  }

  // Additional recommendations based on technologies
  if (technologies.frameworks.includes('PydanticAI')) {
    recommendations.push("Follow PydanticAI best practices for agent development");
    recommendations.push("Use proper async/await patterns throughout");
  }

  if (technologies.languages.python && !configuration.linting.includes('Ruff')) {
    recommendations.push("Consider using Ruff for fast Python linting");
  }

  if (!configuration.cicd.length) {
    recommendations.push("Set up CI/CD pipeline for automated testing and deployment");
  }

  return {
    complexity,
    maintainability,
    testCoverage,
    recommendations,
  };
}

/**
 * Format analysis into comprehensive report
 */
function formatAnalysisReport(analysis: RepositoryAnalysis, input: PrimerInput): string {
  const { structure, technologies, documentation, configuration, dependencies, insights } = analysis;

  return `
# Repository Analysis Report

## 📊 Overview
- **Total Files:** ${structure.files.length}
- **Total Directories:** ${structure.directories.length}
- **Repository Size:** ${formatFileSize(structure.totalSize)}
- **Complexity:** ${insights.complexity}
- **Maintainability:** ${insights.maintainability}

## 🔧 Technologies Detected

### Languages
${Object.entries(technologies.languages)
  .map(([lang, count]) => `- **${lang}**: ${count} files`)
  .join('\n')}

### Frameworks & Libraries
${technologies.frameworks.map(f => `- ${f}`).join('\n')}

### Package Managers
${technologies.packageManagers.map(pm => `- ${pm}`).join('\n')}

## 📚 Documentation
- **README:** ${documentation.readme || '❌ Missing'}
- **Changelog:** ${documentation.changelog || '❌ Missing'}
- **Contributing Guide:** ${documentation.contributing || '❌ Missing'}
- **License:** ${documentation.license || '❌ Missing'}

## ⚙️ Configuration & Tooling

### Build Tools
${configuration.buildTools.length ? configuration.buildTools.map(bt => `- ${bt}`).join('\n') : '❌ No build tools detected'}

### Test Frameworks
${configuration.testFrameworks.length ? configuration.testFrameworks.map(tf => `- ${tf}`).join('\n') : '❌ No test frameworks detected'}

### Linting & Formatting
${configuration.linting.length ? configuration.linting.map(l => `- ${l}`).join('\n') : '❌ No linting tools detected'}

### CI/CD
${configuration.cicd.length ? configuration.cicd.map(ci => `- ${ci}`).join('\n') : '❌ No CI/CD detected'}

## 📦 Dependencies

### Production Dependencies
${Object.entries(dependencies.production).length
  ? Object.entries(dependencies.production).map(([name, version]) => `- ${name}: ${version}`).join('\n')
  : '❌ No production dependencies detected'}

### Development Dependencies
${Object.entries(dependencies.development).length
  ? Object.entries(dependencies.development).map(([name, version]) => `- ${name}: ${version}`).join('\n')
  : '❌ No development dependencies detected'}

## 🎯 Insights & Recommendations

### Quality Metrics
- **Test Coverage:** ${insights.testCoverage}
- **Code Quality:** ${insights.maintainability}
- **Project Complexity:** ${insights.complexity}

### Recommendations
${insights.recommendations.length
  ? insights.recommendations.map(r => `- ${r}`).join('\n')
  : '✅ No immediate recommendations - project looks well structured!'}

## 🏗️ Project Structure
\`\`\`
${structure.directories.map(dir => `📁 ${dir}/`).join('\n')}

Key Files:
${structure.files.slice(0, 20).map(file => `📄 ${file}`).join('\n')}
${structure.files.length > 20 ? `... and ${structure.files.length - 20} more files` : ''}
\`\`\`

---
*Generated by Context Engineering Primer Tool*
  `.trim();
}