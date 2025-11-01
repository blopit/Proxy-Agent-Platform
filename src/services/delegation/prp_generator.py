"""
PRP (Product Requirements Prompt) Generator for Claude Code Task Assignment.

Converts tasks from the delegation system into structured PRP files that Claude Code
can execute via the /execute-prp slash command.
"""

import re
from datetime import datetime
from pathlib import Path
from typing import Dict


def sanitize_filename(title: str) -> str:
    """
    Sanitize task title for use in filename.

    Args:
        title: Task title to sanitize

    Returns:
        str: Safe filename without special characters
    """
    # Remove special characters, replace spaces with underscores
    sanitized = re.sub(r'[^\w\s-]', '', title.lower())
    sanitized = re.sub(r'[\s-]+', '_', sanitized)
    return sanitized[:50]  # Limit length


def generate_prp_from_task(task: Dict) -> str:
    """
    Generate a PRP markdown file content from a task.

    Args:
        task: Task dictionary with keys: task_id, title, description, priority,
              estimated_hours, delegation_mode, category, tags

    Returns:
        str: PRP file content in markdown format
    """
    task_id = task.get('task_id', 'unknown')
    title = task.get('title', 'Untitled Task')
    description = task.get('description', '')
    priority = task.get('priority', 'medium')
    estimated_hours = task.get('estimated_hours', 4.0)
    delegation_mode = task.get('delegation_mode', 'delegate')
    category = task.get('category', 'general')
    tags = task.get('tags', [])

    # Parse acceptance criteria from description
    acceptance_criteria = _extract_acceptance_criteria(description)

    # Generate validation commands based on category
    validation_commands = _generate_validation_commands(category, tags)

    # Build PRP content
    tags_str = ', '.join(tags) if tags else 'none'
    generated_at = datetime.now().isoformat()

    # Default acceptance criteria if none provided
    default_ac = """- Implementation matches requirements
- All tests pass
- Code follows CLAUDE.md conventions"""
    acceptance_criteria_text = acceptance_criteria if acceptance_criteria else default_ac

    prp_content = f"""---
task_id: {task_id}
title: {title}
priority: {priority}
estimated_hours: {estimated_hours}
delegation_mode: {delegation_mode}
category: {category}
tags: {tags_str}
generated_at: {generated_at}
---

# {title}

## Context

{description if description else 'No detailed description provided.'}

## Requirements

{_format_requirements(description)}

## Acceptance Criteria

{acceptance_criteria_text}

## Validation Commands

{validation_commands}

## Implementation Notes

- **Follow TDD**: Write tests first (RED-GREEN-REFACTOR)
- **Reference CLAUDE.md**: Follow project conventions
- **Use TodoWrite**: Track implementation progress
- **Keep functions under 50 lines**: Follow modularity guidelines
- **Test coverage**: Aim for 80%+ coverage on new code
- **Type hints**: Use type annotations for all functions

## Delegation Mode: {delegation_mode.upper()}

{_get_delegation_mode_description(delegation_mode)}

## Related Files

Look for existing patterns in:
- `src/{category}/` - Similar implementations
- `src/{category}/tests/` - Test patterns to follow
- Check for related tasks with similar tags: {tags_str}

---

**Auto-generated PRP** - Task ID: {task_id}
**Estimated effort**: {estimated_hours} hours
"""

    return prp_content


def _extract_acceptance_criteria(description: str) -> str:
    """
    Extract acceptance criteria from task description.

    Looks for sections marked with "Acceptance Criteria:", "AC:", or bullet points.

    Args:
        description: Task description

    Returns:
        str: Formatted acceptance criteria
    """
    if not description:
        return ''

    # Look for explicit acceptance criteria section
    ac_pattern = r'(?:Acceptance Criteria|AC):\s*\n(.*?)(?=\n\n|\n#|$)'
    match = re.search(ac_pattern, description, re.IGNORECASE | re.DOTALL)

    if match:
        return match.group(1).strip()

    # Look for bullet points that might be criteria
    bullet_pattern = r'((?:^[-*]\s+.+\n?)+)'
    match = re.search(bullet_pattern, description, re.MULTILINE)

    if match:
        return match.group(1).strip()

    return ''


def _format_requirements(description: str) -> str:
    """
    Format requirements section from description.

    Args:
        description: Task description

    Returns:
        str: Formatted requirements
    """
    if not description:
        return '- Implement the feature as described in the title'

    # If description has bullet points, use them
    if re.search(r'^[-*]\s+', description, re.MULTILINE):
        return description

    # Otherwise, convert description to bullet points
    lines = [line.strip() for line in description.split('\n') if line.strip()]
    if len(lines) == 1:
        return f'- {lines[0]}'

    return '\n'.join(f'- {line}' for line in lines[:5])  # Limit to first 5 lines


def _generate_validation_commands(category: str, tags: list) -> str:
    """
    Generate validation commands based on task category and tags.

    Args:
        category: Task category (backend, frontend, etc.)
        tags: List of task tags

    Returns:
        str: Formatted validation commands
    """
    commands = []

    # Python/Backend validation
    if category in ['backend', 'api', 'database'] or any(
        tag in tags for tag in ['python', 'backend', 'api', 'database']
    ):
        commands.extend([
            '```bash',
            '# Run tests for the modified modules',
            'uv run pytest src/{module}/tests/ -v',
            '',
            '# Check test coverage',
            'uv run pytest --cov=src/{module} --cov-report=term-missing',
            '',
            '# Lint check',
            'uv run ruff check src/{module}/',
            '',
            '# Type check',
            'uv run mypy src/{module}/',
            '```',
        ])

    # Frontend validation
    if category == 'frontend' or any(tag in tags for tag in ['frontend', 'react', 'ui']):
        commands.extend([
            '```bash',
            '# Run frontend tests',
            'cd frontend && npm test',
            '',
            '# Type check',
            'cd frontend && npm run type-check',
            '',
            '# Lint check',
            'cd frontend && npm run lint',
            '',
            '# Build check',
            'cd frontend && npm run build',
            '```',
        ])

    # Default validation if no specific commands
    if not commands:
        commands.extend([
            '```bash',
            '# Run relevant tests',
            'uv run pytest tests/ -v',
            '',
            '# Lint check',
            'uv run ruff check .',
            '```',
        ])

    return '\n'.join(commands)


def _get_delegation_mode_description(mode: str) -> str:
    """
    Get description for delegation mode.

    Args:
        mode: Delegation mode (do, do_with_me, delegate, delete)

    Returns:
        str: Description of what the mode means
    """
    mode_descriptions = {
        'do': '**DO** - This task requires direct human involvement. Claude Code should implement it fully but may need human verification.',
        'do_with_me': '**DO_WITH_ME** - Collaborative task. Claude Code implements with human guidance. Ask questions if clarification needed.',
        'delegate': '**DELEGATE** - Fully delegated. Claude Code has full autonomy to implement this task end-to-end.',
        'delete': '**DELETE** - This task should be eliminated or deprecated. Discuss with human before proceeding.',
    }

    return mode_descriptions.get(mode, '**DELEGATE** - Standard implementation task.')


def save_prp_file(task: Dict, prp_dir: Path) -> Path:
    """
    Generate PRP content and save to file.

    Args:
        task: Task dictionary
        prp_dir: Directory to save PRP files

    Returns:
        Path: Path to saved PRP file

    Raises:
        OSError: If file cannot be written
    """
    # Generate PRP content
    prp_content = generate_prp_from_task(task)

    # Create filename
    task_id = task.get('task_id', 'unknown')
    title = task.get('title', 'untitled')
    sanitized_title = sanitize_filename(title)
    filename = f"{task_id}_{sanitized_title}.prp.md"

    # Ensure directory exists
    prp_dir.mkdir(parents=True, exist_ok=True)

    # Write file
    file_path = prp_dir / filename
    file_path.write_text(prp_content, encoding='utf-8')

    return file_path
