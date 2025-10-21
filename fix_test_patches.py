#!/usr/bin/env python3
"""
Script to fix test_task_endpoints.py by removing unnecessary patch() blocks.
"""
import re

def fix_patch_blocks(content: str) -> str:
    """Remove 'with patch()' blocks and de-indent their content."""
    lines = content.split('\n')
    result = []
    i = 0

    while i < len(lines):
        line = lines[i]

        # Check if this line is a 'with patch(' line for get_task_service
        if re.match(r'\s+with patch\("src\.api\.tasks\.get_task_service', line):
            # Skip this line
            i += 1
            # De-indent the next lines (the content inside the with block)
            while i < len(lines):
                next_line = lines[i]
                # If the line is dedented (back to original level), we're done with this block
                if next_line and not next_line.startswith('            '):
                    break
                # De-indent by 4 spaces
                if next_line.startswith('            '):
                    result.append(next_line[4:])
                else:
                    result.append(next_line)
                i += 1
        else:
            result.append(line)
            i += 1

    return '\n'.join(result)

if __name__ == "__main__":
    file_path = "src/api/tests/test_task_endpoints.py"

    with open(file_path, 'r') as f:
        content = f.read()

    fixed_content = fix_patch_blocks(content)

    with open(file_path, 'w') as f:
        f.write(fixed_content)

    print(f"Fixed {file_path}")
