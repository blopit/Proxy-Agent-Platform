---
name: execute-prp-with-review
description: Execute PRP with integrated human testing checkpoints
args:
  - name: prp_file
    description: Path to the PRP file to execute
    required: true
---

# Execute PRP with Human Review

Implement a feature using the PRP file with integrated human testing checkpoints.

## PRP File: $ARGUMENTS

## Human-AI Collaborative Process

### **Phase 1: AI Implementation**
1. **Load and Analyze PRP**
   - Read the specified PRP file completely
   - Understand all context and requirements
   - Create comprehensive implementation plan using TodoWrite
   - Identify human checkpoint moments

2. **Execute Implementation**
   - Implement core functionality
   - Write comprehensive tests
   - Ensure code quality standards
   - Document implementation decisions

### **Phase 2: Human Checkpoint 1 - Technical Review**
**🔄 HUMAN REVIEW REQUIRED**

Before proceeding, please:
- **Review Implementation**: Check code quality and architecture
- **Test Functionality**: Verify core features work as expected
- **Validate Approach**: Confirm technical decisions align with requirements
- **Provide Feedback**: Any concerns or suggested improvements

**Human Response Required**: Type "APPROVED" to continue or provide specific feedback for refinement.

### **Phase 3: AI Refinement (if needed)**
Based on human feedback:
- Address any technical concerns
- Implement suggested improvements
- Update tests and documentation
- Re-run validation suite

### **Phase 4: Human Checkpoint 2 - User Experience**
**🔄 HUMAN REVIEW REQUIRED**

Please test the user experience:
- **Task Capture**: Test 2-second capture requirement
- **User Flow**: Validate end-to-end workflows
- **Mobile Integration**: Test mobile functionality if applicable
- **Performance**: Verify response times meet requirements

**Human Response Required**: Type "UX-APPROVED" to continue or provide UX feedback.

### **Phase 5: Final Validation**
- Run complete test suite
- Validate all acceptance criteria
- Update documentation
- Prepare feature demonstration
- Mark epic tasks as completed

## Quality Gates

### **Automated Validation**
```bash
# Code quality and tests
uv run ruff check --fix
uv run mypy .
uv run pytest tests/ -v --cov=src --cov-report=html

# Performance validation
uv run pytest tests/performance/ -v
```

### **Human Validation Checklist**
- [ ] Feature works as specified in PRP
- [ ] User experience meets expectations
- [ ] Performance requirements satisfied
- [ ] Mobile integration functional (if applicable)
- [ ] Code quality standards maintained
- [ ] Documentation complete and accurate

### **Success Criteria**
- All automated tests pass
- Human technical review approved
- Human UX review approved
- Performance benchmarks met
- Ready for integration with other components

---

**This process ensures both AI efficiency and human validation for optimal results.**