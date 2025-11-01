#!/usr/bin/env python3
"""
Design System Compliance Audit Script
Analyzes which components use design tokens vs hardcoded values
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Tuple

# Component categories
CATEGORIES = {
    'System': 'src/components/system',
    'Shared': 'src/components/shared',
    'Dashboard': 'src/components/dashboard',
    'Tasks': 'src/components/tasks',
    'Workflows': 'src/components/workflows',
    'Mobile': 'src/components/mobile',
    'Mobile/Modes': 'src/components/mobile/modes',
    'Mobile/Scout': 'src/components/mobile/scout',
    'Mobile/Cards': 'src/components/mobile/cards',
}

def find_components(base_path: str) -> List[Path]:
    """Find all .tsx component files (excluding stories and tests)"""
    components = []
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.endswith('.tsx') and not file.endswith('.stories.tsx') and not file.endswith('.test.tsx'):
                components.append(Path(root) / file)
    return components

def uses_design_system(file_path: Path) -> bool:
    """Check if file imports from design-system"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            return "from '@/lib/design-system'" in content or 'from "@/lib/design-system"' in content
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return False

def find_hardcoded_values(file_path: Path) -> Dict[str, int]:
    """Find hardcoded design values in file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        violations = {
            'hardcoded_colors': len(re.findall(r'#[0-9a-fA-F]{6}', content)),
            'hardcoded_px': len(re.findall(r"['\"](\d+)px['\"]", content)),
            'inline_styles': len(re.findall(r'style=\{\{', content)),
        }
        return violations
    except Exception as e:
        return {'hardcoded_colors': 0, 'hardcoded_px': 0, 'inline_styles': 0}

def audit_components(base_path: str = 'src/components'):
    """Run complete audit of all components"""

    print("=" * 80)
    print("DESIGN SYSTEM COMPLIANCE AUDIT")
    print("=" * 80)
    print()

    all_components = find_components(base_path)
    compliant = []
    non_compliant = []

    # Overall stats
    for component in all_components:
        if uses_design_system(component):
            compliant.append(component)
        else:
            non_compliant.append(component)

    total = len(all_components)
    compliant_count = len(compliant)
    compliance_rate = (compliant_count / total * 100) if total > 0 else 0

    print(f"📊 OVERALL STATISTICS")
    print(f"{'─' * 80}")
    print(f"Total Components: {total}")
    print(f"✅ Compliant: {compliant_count} ({compliance_rate:.1f}%)")
    print(f"❌ Non-Compliant: {len(non_compliant)} ({100-compliance_rate:.1f}%)")
    print()

    # Category breakdown
    print(f"📂 BY CATEGORY")
    print(f"{'─' * 80}")

    for category_name, category_path in CATEGORIES.items():
        if not os.path.exists(category_path):
            continue

        category_components = [c for c in all_components if category_path in str(c)]
        if not category_components:
            continue

        category_compliant = [c for c in category_components if uses_design_system(c)]
        category_rate = (len(category_compliant) / len(category_components) * 100) if category_components else 0

        print(f"\n{category_name} ({len(category_components)} components) - {category_rate:.0f}% compliant")

        for component in sorted(category_components, key=lambda x: x.name):
            is_compliant = component in category_compliant
            icon = "✅" if is_compliant else "❌"
            print(f"  {icon} {component.name}")

    # Priority migration list
    print()
    print(f"\n🎯 PRIORITY MIGRATION LIST")
    print(f"{'─' * 80}")
    print("\nHigh Priority (Core UI Components):")

    high_priority = [
        'src/components/shared/ProgressBar.tsx',
        'src/components/shared/TaskCheckbox.tsx',
        'src/components/shared/OpenMoji.tsx',
        'src/components/dashboard/StatsCard.tsx',
        'src/components/dashboard/ActivityFeed.tsx',
        'src/components/tasks/QuickCapture.tsx',
        'src/components/tasks/TaskList.tsx',
    ]

    for priority_path in high_priority:
        full_path = Path(priority_path)
        if full_path.exists():
            violations = find_hardcoded_values(full_path)
            is_compliant = uses_design_system(full_path)
            icon = "✅" if is_compliant else "❌"
            severity = sum(violations.values())
            print(f"  {icon} {full_path.name} - Violations: {severity}")
            if not is_compliant and severity > 0:
                print(f"      Colors: {violations['hardcoded_colors']}, Px values: {violations['hardcoded_px']}, Inline styles: {violations['inline_styles']}")

    print("\n\nMedium Priority (Mobile Components):")
    medium_priority = [c for c in non_compliant if 'mobile' in str(c) and c not in [Path(p) for p in high_priority]][:10]
    for component in medium_priority:
        violations = find_hardcoded_values(component)
        severity = sum(violations.values())
        print(f"  ❌ {component.name} - Violations: {severity}")

    print("\n\nLow Priority (Utility/Legacy):")
    low_priority = [
        'src/components/ui/card.tsx',
        'src/components/ErrorBoundary.tsx',
        'src/components/PerformanceOptimizer.tsx',
    ]
    for priority_path in low_priority:
        full_path = Path(priority_path)
        if full_path.exists() and not uses_design_system(full_path):
            violations = find_hardcoded_values(full_path)
            severity = sum(violations.values())
            print(f"  ❌ {full_path.name} - Violations: {severity}")

    return {
        'total': total,
        'compliant': compliant_count,
        'non_compliant': len(non_compliant),
        'compliance_rate': compliance_rate,
        'non_compliant_list': [str(c.relative_to('src/components')) for c in non_compliant]
    }

if __name__ == '__main__':
    os.chdir('/Users/shrenilpatel/Github/Proxy-Agent-Platform/frontend')
    results = audit_components()

    print("\n\n" + "=" * 80)
    print("AUDIT COMPLETE")
    print("=" * 80)
    print(f"\nCompliance Rate: {results['compliance_rate']:.1f}%")
    print(f"Components to migrate: {results['non_compliant']}")
