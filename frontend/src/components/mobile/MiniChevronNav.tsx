/**
 * MiniChevronNav - Compact chevron navigation for section progress within subtabs
 *
 * Features:
 * - Shows current position within MAP or PLAN subtab
 * - Sticky header that updates as user scrolls through sections
 * - Nano-sized chevrons for minimal visual footprint
 * - Click to navigate directly to sections
 * - ADHD-friendly: provides spatial awareness without cluttering UI
 *
 * Usage:
 * <MiniChevronNav
 *   sections={[
 *     { id: 'stats', icon: '📊', label: 'Stats' },
 *     { id: 'wins', icon: '🏆', label: 'Wins' }
 *   ]}
 *   currentSection="stats"
 *   onNavigate={(id) => scrollToSection(id)}
 * />
 */

'use client';

import React from 'react';
import ChevronStep from './ChevronStep';

// ============================================================================
// Types
// ============================================================================

export interface MiniChevronSection {
  id: string;
  icon: string;
  label: string;
}

export interface MiniChevronNavProps {
  sections: MiniChevronSection[];
  currentSection: string;
  onNavigate?: (sectionId: string) => void;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export default function MiniChevronNav({
  sections,
  currentSection,
  onNavigate,
  className = '',
}: MiniChevronNavProps) {
  const getPosition = (index: number): 'first' | 'middle' | 'last' | 'single' => {
    if (sections.length === 1) return 'single';
    if (index === 0) return 'first';
    if (index === sections.length - 1) return 'last';
    return 'middle';
  };

  const getStatus = (sectionId: string): 'done' | 'active' | 'next' | 'pending' => {
    const currentIndex = sections.findIndex(s => s.id === currentSection);
    const sectionIndex = sections.findIndex(s => s.id === sectionId);

    if (sectionIndex < currentIndex) return 'done';
    if (sectionIndex === currentIndex) return 'active';
    if (sectionIndex === currentIndex + 1) return 'next';
    return 'pending';
  };

  const handleSectionClick = (sectionId: string) => {
    onNavigate?.(sectionId);
  };

  return (
    <div
      className={`mini-chevron-nav ${className}`}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: '#002b36',
        borderBottom: '1px solid #073642',
        padding: '8px 16px',
      }}
    >
      <div style={{ display: 'flex', gap: 0, justifyContent: 'center', alignItems: 'center' }}>
        {sections.map((section, index) => (
          <div key={section.id} style={{ marginRight: index < sections.length - 1 ? '-2px' : '0' }}>
            <ChevronStep
              status={getStatus(section.id)}
              position={getPosition(index)}
              size="nano"
              width="36px"
              emoji={section.icon}
              onClick={() => handleSectionClick(section.id)}
              ariaLabel={`Navigate to ${section.label} section`}
            />
          </div>
        ))}
      </div>

      {/* Section label hint */}
      <div
        style={{
          marginTop: '4px',
          textAlign: 'center',
          fontSize: '9px',
          color: '#586e75',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {sections.find(s => s.id === currentSection)?.label || ''}
      </div>
    </div>
  );
}
