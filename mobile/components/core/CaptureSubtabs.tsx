/**
 * CaptureSubtabs - Subtabs within Capture mode
 *
 * - ➕ Add - Quick task addition
 * - ❓ Clarify - Task clarification interface
 */

import React from 'react';
import { Plus, MessageCircleQuestion } from 'lucide-react-native';
import { Tabs, TabItem } from './Tabs';
import { THEME } from '../../src/theme/colors';

export type CaptureSubtab = 'add' | 'clarify';

interface CaptureSubtabsProps {
  activeSubtab: CaptureSubtab;
  onChange: (subtab: CaptureSubtab) => void;
}

const CAPTURE_SUBTAB_CONFIG: TabItem<CaptureSubtab>[] = [
  {
    id: 'add',
    icon: Plus,
    label: 'Add',
    color: THEME.cyan,
    description: 'Add new task',
  },
  {
    id: 'clarify',
    icon: MessageCircleQuestion,
    label: 'Clarify',
    color: THEME.yellow,
    description: 'Clarify task details',
  },
];

export default function CaptureSubtabs({ activeSubtab, onChange }: CaptureSubtabsProps) {
  return (
    <Tabs
      tabs={CAPTURE_SUBTAB_CONFIG}
      activeTab={activeSubtab}
      onChange={onChange}
      showLabels={true}
      showActiveIndicator={false}
      containerStyle={{
        borderTopWidth: 0, // No top border for subtabs
        paddingTop: 2,
        paddingBottom: 2,
      }}
    />
  );
}
