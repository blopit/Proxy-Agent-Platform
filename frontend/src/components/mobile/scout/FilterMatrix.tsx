'use client';

import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import ExpandableTile from '../ExpandableTile';
import ChevronButton from '../ChevronButton';
import { spacing, fontSize, borderRadius, iconSize, semanticColors, colors } from '@/lib/design-system';

// ============================================================================
// Types
// ============================================================================

export interface FilterState {
  priority?: ('urgent' | 'high' | 'medium' | 'low')[];
  timeframe?: ('overdue' | 'today' | 'this_week' | 'this_month' | 'later')[];
  zones?: string[];
  tags?: string[];
  energyLevel?: { min: number; max: number };
  estimatedHours?: { min: number; max: number };
}

export interface FilterMatrixProps {
  activeFilters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableTags?: string[];
  availableZones?: string[];
  defaultExpanded?: boolean;
}

// ============================================================================
// Component
// ============================================================================

const FilterMatrix: React.FC<FilterMatrixProps> = ({
  activeFilters,
  onFiltersChange,
  availableTags = [],
  availableZones = ['Work', 'Health', 'Relationships', 'Growth', 'Home'],
  defaultExpanded = false,
}) => {
  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.priority && activeFilters.priority.length > 0) count++;
    if (activeFilters.timeframe && activeFilters.timeframe.length > 0) count++;
    if (activeFilters.zones && activeFilters.zones.length > 0) count++;
    if (activeFilters.tags && activeFilters.tags.length > 0) count++;
    if (activeFilters.energyLevel) count++;
    if (activeFilters.estimatedHours) count++;
    return count;
  };

  const activeCount = getActiveFilterCount();

  // Toggle filter values
  const togglePriority = (priority: 'urgent' | 'high' | 'medium' | 'low') => {
    const current = activeFilters.priority || [];
    const updated = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority];
    onFiltersChange({ ...activeFilters, priority: updated.length > 0 ? updated : undefined });
  };

  const toggleTimeframe = (timeframe: 'overdue' | 'today' | 'this_week' | 'this_month' | 'later') => {
    const current = activeFilters.timeframe || [];
    const updated = current.includes(timeframe)
      ? current.filter((t) => t !== timeframe)
      : [...current, timeframe];
    onFiltersChange({ ...activeFilters, timeframe: updated.length > 0 ? updated : undefined });
  };

  const toggleZone = (zone: string) => {
    const current = activeFilters.zones || [];
    const updated = current.includes(zone) ? current.filter((z) => z !== zone) : [...current, zone];
    onFiltersChange({ ...activeFilters, zones: updated.length > 0 ? updated : undefined });
  };

  const toggleTag = (tag: string) => {
    const current = activeFilters.tags || [];
    const updated = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
    onFiltersChange({ ...activeFilters, tags: updated.length > 0 ? updated : undefined });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  // Priority badge styling
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { color: semanticColors.accent.error, label: '🔴 Urgent' };
      case 'high':
        return { color: colors.orange, label: '🟠 High' };
      case 'medium':
        return { color: semanticColors.accent.warning, label: '🟡 Medium' };
      case 'low':
        return { color: semanticColors.accent.primary, label: '🔵 Low' };
      default:
        return { color: semanticColors.text.secondary, label: priority };
    }
  };

  // Timeframe badge styling
  const getTimeframeStyle = (timeframe: string) => {
    switch (timeframe) {
      case 'overdue':
        return { label: '⏰ Overdue', color: semanticColors.accent.error };
      case 'today':
        return { label: '📅 Today', color: semanticColors.accent.warning };
      case 'this_week':
        return { label: '📆 This Week', color: semanticColors.accent.primary };
      case 'this_month':
        return { label: '🗓️ This Month', color: colors.violet };
      case 'later':
        return { label: '⏳ Later', color: semanticColors.text.secondary };
      default:
        return { label: timeframe, color: semanticColors.text.secondary };
    }
  };

  // ============================================================================
  // Micro Content (Collapsed View)
  // ============================================================================

  const microContent = (
    <div
      style={{
        padding: spacing[4],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
        <Filter size={iconSize.base} style={{ color: semanticColors.accent.primary }} />
        <h3
          style={{
            fontSize: fontSize.base,
            fontWeight: 700,
            color: semanticColors.text.primary,
          }}
        >
          Filters
        </h3>
        {activeCount > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: spacing[5],
              height: spacing[5],
              borderRadius: borderRadius.full,
              backgroundColor: semanticColors.accent.primary,
              color: semanticColors.text.inverse,
              fontSize: fontSize.xs,
              fontWeight: 700,
            }}
          >
            {activeCount}
          </div>
        )}
      </div>
      <span style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary }}>Tap to expand</span>
    </div>
  );

  // ============================================================================
  // Expanded Content (Full Filter UI)
  // ============================================================================

  const expandedContent = (
    <div style={{ padding: spacing[4] }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing[4],
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <Filter size={iconSize.base} style={{ color: semanticColors.accent.primary }} />
          <h3
            style={{
              fontSize: fontSize.base,
              fontWeight: 700,
              color: semanticColors.text.primary,
            }}
          >
            Filter Tasks
          </h3>
        </div>
        {activeCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearAllFilters();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[1],
              padding: `${spacing[1]} ${spacing[2]}`,
              backgroundColor: 'transparent',
              border: `1px solid ${semanticColors.border.default}`,
              borderRadius: borderRadius.base,
              color: semanticColors.text.secondary,
              fontSize: fontSize.xs,
              cursor: 'pointer',
            }}
          >
            <X size={12} />
            Clear All
          </button>
        )}
      </div>

      {/* Priority Section */}
      <div style={{ marginBottom: spacing[4] }}>
        <div
          style={{
            fontSize: fontSize.sm,
            fontWeight: 600,
            color: semanticColors.text.primary,
            marginBottom: spacing[2],
          }}
        >
          Priority
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: spacing[2],
          }}
        >
          {(['urgent', 'high', 'medium', 'low'] as const).map((priority) => {
            const isActive = activeFilters.priority?.includes(priority) || false;
            const style = getPriorityStyle(priority);
            return (
              <ChevronButton
                key={priority}
                label={style.label}
                variant={isActive ? 'primary' : 'neutral'}
                position="single"
                size="micro"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePriority(priority);
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Timeframe Section */}
      <div style={{ marginBottom: spacing[4] }}>
        <div
          style={{
            fontSize: fontSize.sm,
            fontWeight: 600,
            color: semanticColors.text.primary,
            marginBottom: spacing[2],
          }}
        >
          Timeframe
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: spacing[2],
          }}
        >
          {(['overdue', 'today', 'this_week', 'this_month', 'later'] as const).map((timeframe) => {
            const isActive = activeFilters.timeframe?.includes(timeframe) || false;
            const style = getTimeframeStyle(timeframe);
            return (
              <ChevronButton
                key={timeframe}
                label={style.label}
                variant={isActive ? 'primary' : 'neutral'}
                position="single"
                size="micro"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTimeframe(timeframe);
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Zones Section */}
      {availableZones.length > 0 && (
        <div style={{ marginBottom: spacing[4] }}>
          <div
            style={{
              fontSize: fontSize.sm,
              fontWeight: 600,
              color: semanticColors.text.primary,
              marginBottom: spacing[2],
            }}
          >
            Life Zones
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: spacing[2],
            }}
          >
            {availableZones.map((zone) => {
              const isActive = activeFilters.zones?.includes(zone) || false;
              return (
                <button
                  key={zone}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleZone(zone);
                  }}
                  style={{
                    padding: `${spacing[1]} ${spacing[3]}`,
                    backgroundColor: isActive ? semanticColors.accent.primary : semanticColors.bg.secondary,
                    border: `1px solid ${isActive ? semanticColors.accent.primary : semanticColors.border.default}`,
                    borderRadius: borderRadius.full,
                    color: isActive ? semanticColors.text.inverse : semanticColors.text.primary,
                    fontSize: fontSize.xs,
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {zone}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tags Section */}
      {availableTags.length > 0 && (
        <div style={{ marginBottom: spacing[4] }}>
          <div
            style={{
              fontSize: fontSize.sm,
              fontWeight: 600,
              color: semanticColors.text.primary,
              marginBottom: spacing[2],
            }}
          >
            Tags
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: spacing[2],
            }}
          >
            {availableTags.map((tag) => {
              const isActive = activeFilters.tags?.includes(tag) || false;
              return (
                <button
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTag(tag);
                  }}
                  style={{
                    padding: `${spacing[1]} ${spacing[3]}`,
                    backgroundColor: isActive ? colors.violet : semanticColors.bg.secondary,
                    border: `1px solid ${isActive ? colors.violet : semanticColors.border.default}`,
                    borderRadius: borderRadius.full,
                    color: isActive ? semanticColors.text.inverse : semanticColors.text.primary,
                    fontSize: fontSize.xs,
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Energy Level Section */}
      <div style={{ marginBottom: spacing[4] }}>
        <div
          style={{
            fontSize: fontSize.sm,
            fontWeight: 600,
            color: semanticColors.text.primary,
            marginBottom: spacing[2],
          }}
        >
          Energy Required
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: spacing[2],
          }}
        >
          {[
            { label: '⚡ Low (1-3)', range: { min: 1, max: 3 } },
            { label: '⚡⚡ Medium (4-6)', range: { min: 4, max: 6 } },
            { label: '⚡⚡⚡ High (7-10)', range: { min: 7, max: 10 } },
          ].map((option) => {
            const isActive =
              activeFilters.energyLevel?.min === option.range.min &&
              activeFilters.energyLevel?.max === option.range.max;
            return (
              <button
                key={option.label}
                onClick={(e) => {
                  e.stopPropagation();
                  onFiltersChange({
                    ...activeFilters,
                    energyLevel: isActive ? undefined : option.range,
                  });
                }}
                style={{
                  padding: `${spacing[2]} ${spacing[1]}`,
                  backgroundColor: isActive ? semanticColors.accent.success : semanticColors.bg.secondary,
                  border: `1px solid ${isActive ? semanticColors.accent.success : semanticColors.border.default}`,
                  borderRadius: borderRadius.base,
                  color: isActive ? semanticColors.text.inverse : semanticColors.text.primary,
                  fontSize: fontSize.xs,
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Estimated Hours Section */}
      <div>
        <div
          style={{
            fontSize: fontSize.sm,
            fontWeight: 600,
            color: semanticColors.text.primary,
            marginBottom: spacing[2],
          }}
        >
          Time Required
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: spacing[2],
          }}
        >
          {[
            { label: '⏱️ Quick (<30min)', range: { min: 0, max: 0.5 } },
            { label: '⏱️ Short (30min-2hr)', range: { min: 0.5, max: 2 } },
            { label: '⏱️ Medium (2-4hr)', range: { min: 2, max: 4 } },
            { label: '⏱️ Long (4hr+)', range: { min: 4, max: 999 } },
          ].map((option) => {
            const isActive =
              activeFilters.estimatedHours?.min === option.range.min &&
              activeFilters.estimatedHours?.max === option.range.max;
            return (
              <button
                key={option.label}
                onClick={(e) => {
                  e.stopPropagation();
                  onFiltersChange({
                    ...activeFilters,
                    estimatedHours: isActive ? undefined : option.range,
                  });
                }}
                style={{
                  padding: spacing[2],
                  backgroundColor: isActive ? colors.orange : semanticColors.bg.secondary,
                  border: `1px solid ${isActive ? colors.orange : semanticColors.border.default}`,
                  borderRadius: borderRadius.base,
                  color: isActive ? semanticColors.text.inverse : semanticColors.text.primary,
                  fontSize: fontSize.xs,
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return <ExpandableTile microContent={microContent} expandedContent={expandedContent} defaultExpanded={defaultExpanded} />;
};

export default FilterMatrix;
