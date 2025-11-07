#!/bin/bash
# Script to update Text imports from react-native to custom Text component

# List of files to update (components, not stories yet)
FILES=(
  "components/ui/Button.tsx"
  "components/ui/Badge.tsx"
  "components/cards/TaskCardBig.tsx"
  "components/cards/SuggestionCard.tsx"
  "components/core/ChevronButton.tsx"
  "components/core/ChevronStep.tsx"
  "components/core/Tabs.tsx"
  "components/core/EnergyGauge.tsx"
  "components/connections/ConnectionElement.tsx"
  "components/auth/SocialLoginButton.tsx"
  "components/tasks/TaskList.tsx"
  "components/timeline/TimelineView.tsx"
  "components/focus/FocusTimer.tsx"
  "components/ProfileSwitcher.tsx"
)

cd /Users/shrenilpatel/Github/Proxy-Agent-Platform/mobile

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."

    # Check if file already imports custom Text
    if grep -q "from '@/src/components/ui/Text'" "$file"; then
      echo "  ✓ Already using custom Text"
      continue
    fi

    # Check if file imports Text from react-native
    if ! grep -q "Text.*from 'react-native'" "$file"; then
      echo "  ⚠ No Text import from react-native found"
      continue
    fi

    # Backup the file
    cp "$file" "$file.bak"

    # Replace Text import - handle different import patterns
    # Pattern 1: import { Text, ... } from 'react-native';
    # Pattern 2: import { ..., Text, ... } from 'react-native';
    # Pattern 3: import { ..., Text } from 'react-native';

    # First, add the custom Text import at the top
    sed -i '' "1a\\
import { Text } from '@/src/components/ui/Text';\\
" "$file"

    # Remove Text from react-native import
    sed -i '' "s/import { Text, \(.*\) } from 'react-native';/import { \1 } from 'react-native';/" "$file"
    sed -i '' "s/import { \(.*\), Text, \(.*\) } from 'react-native';/import { \1, \2 } from 'react-native';/" "$file"
    sed -i '' "s/import { \(.*\), Text } from 'react-native';/import { \1 } from 'react-native';/" "$file"

    # Clean up any double commas
    sed -i '' "s/, ,/,/g" "$file"
    sed -i '' "s/{ ,/{ /g" "$file"
    sed -i '' "s/, }/}/g" "$file"

    echo "  ✓ Updated"
  else
    echo "⚠ File not found: $file"
  fi
done

echo ""
echo "✓ All component files updated!"
echo "Backup files created with .bak extension"
