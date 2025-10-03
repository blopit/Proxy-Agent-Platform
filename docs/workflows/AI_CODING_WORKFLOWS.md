# 🤖 AI Coding Workflows Foundation

This document outlines the AI-powered development workflows for the Proxy Agent Platform, designed to maximize productivity through systematic AI assistance.

## 🎯 Core Workflow Components

### **1. Context Engineering Approach**
- **Prime Context**: Use `/primer` to establish comprehensive project understanding
- **Systematic Analysis**: Break down complex tasks into manageable components
- **Iterative Refinement**: Continuous validation and improvement cycles

### **2. PRP (Product Requirements Prompt) Workflow**
- **Generate PRP**: `/generate-prp <feature-file>` - Create comprehensive implementation plans
- **Execute PRP**: `/execute-prp <prp-file>` - Systematic feature implementation
- **Validation Gates**: Automated quality checks and testing

### **3. Parallel Development**
- **Prep Parallel**: `/prep-parallel <feature> <num-worktrees>` - Set up parallel work environments
- **Execute Parallel**: `/execute-parallel <feature> <plan> <num-worktrees>` - Concurrent implementation
- **Best Version Selection**: Compare and merge optimal implementations

## 🛠️ Available Commands

### **Core Commands**
```bash
/primer                           # Analyze project structure and establish context
/generate-prp <feature-file>      # Generate comprehensive implementation plan
/execute-prp <prp-file>          # Execute feature implementation
/fix-github-issue <issue-number> # Analyze and fix GitHub issues
```

### **Parallel Development Commands**
```bash
/prep-parallel <feature> <num>   # Initialize parallel worktrees
/execute-parallel <feature> <plan> <num> # Parallel implementation
```

## 📋 Workflow Process

### **Phase 1: Context Establishment**
1. Run `/primer` to understand project structure
2. Analyze epic breakdown in `tasks/epics/`
3. Review CLAUDE.md for coding standards
4. Identify current implementation status

### **Phase 2: Feature Planning**
1. Create feature specification file
2. Run `/generate-prp <feature-file>` for comprehensive plan
3. Review generated PRP for completeness
4. Adjust plan based on project constraints

### **Phase 3: Implementation**
1. Execute `/execute-prp <prp-file>` for systematic implementation
2. Follow validation gates for quality assurance
3. Use TodoWrite tool for progress tracking
4. Iterate based on test results

### **Phase 4: Quality Assurance**
1. Run automated tests (`uv run pytest`)
2. Check code quality (`uv run ruff check`)
3. Validate against acceptance criteria
4. Document implementation decisions

## 🎯 Best Practices

### **Context Engineering**
- **Always start with `/primer`** to establish proper context
- **Use TodoWrite tool** for task breakdown and progress tracking
- **Follow CLAUDE.md standards** for consistent code quality
- **Reference existing patterns** from the codebase

### **PRP Development**
- **Comprehensive research** before implementation
- **Clear acceptance criteria** for validation
- **Executable validation gates** for quality assurance
- **Pattern recognition** from existing codebase

### **Parallel Development**
- **Use for complex features** that benefit from multiple approaches
- **Compare implementations** to select optimal solution
- **Maintain isolation** between parallel workstreams
- **Document decision rationale** for chosen approach

## 🚀 Integration with Epic System

### **Epic-Driven Development**
1. **Select Epic**: Choose from `tasks/epics/epic-N-*/tasks.md`
2. **Break Down Tasks**: Use TodoWrite for individual task tracking
3. **Generate PRPs**: Create implementation plans for complex tasks
4. **Execute Systematically**: Follow epic task order and dependencies

### **Progress Tracking**
- **Epic Level**: Weekly progress updates in master task list
- **Task Level**: Daily TodoWrite updates for immediate tasks
- **Implementation Level**: PRP execution with validation gates
- **Quality Level**: Continuous testing and code quality checks

## 📊 Success Metrics

### **Development Velocity**
- Reduced time from concept to implementation
- Higher first-pass implementation success rate
- Fewer iteration cycles needed for completion
- Consistent code quality across features

### **Quality Assurance**
- Automated validation gate success rate
- Test coverage maintenance above 95%
- Code review efficiency improvements
- Reduced bug introduction rate

---

**Note**: This workflow system is designed to work seamlessly with the Proxy Agent Platform's epic-based development approach, providing tactical implementation support for the strategic epic roadmap.