'use client'

import React from 'react';
import { X, Plus } from 'lucide-react';
import ChevronButton from '../core/ChevronButton';

/**
 * SuggestionCard - 40px tall card for AI-powered suggestions
 *
 * Features:
 * - Fixed 40px height for compact list display
 * - Overlapping circular brand icons (avatar stack) for sources
 * - Truncated suggestion text with ellipsis
 * - Optional metadata badge (e.g., "2h ago")
 * - Small dismiss X button (top right)
 * - ChevronButton "Add" action
 * - Solarized dark theme
 *
 * Layout: [Icons] Suggestion text... [Metadata] [X] [Add Button]
 */

export interface Source {
  iconSvg: string; // SVG path data from simple-icons
  iconColor: string; // Brand color from simple-icons
  name: string; // Brand name for accessibility
}

export interface SuggestionCardProps {
  text: string;
  sources: Source[];
  metadata?: string; // Optional metadata like "2h ago", "Gmail", etc.
  onAdd: () => void;
  onDismiss: () => void;
  className?: string;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  text,
  sources,
  metadata,
  onAdd,
  onDismiss,
  className = ''
}) => {
  return (
    <div
      className={`suggestion-card ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        height: '40px',
        padding: '0 12px',
        backgroundColor: 'var(--secondary-bg-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Left: Overlapping brand source icons (avatar stack) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        position: 'relative',
        height: '24px',
        width: sources.length === 1 ? '24px' : `${24 + (sources.length - 1) * 14}px`
      }}>
        {sources.map((source, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${index * 14}px`,
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--background-color)',
              border: '2px solid var(--secondary-bg-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: sources.length - index
            }}
            title={source.name}
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d={source.iconSvg} fill={source.iconColor} />
            </svg>
          </div>
        ))}
      </div>

      {/* Middle: Suggestion text (truncated) */}
      <div style={{
        flex: 1,
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--text-color)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        minWidth: 0 // Allow flex item to shrink below content size
      }}>
        {text}
      </div>

      {/* Metadata badge (if provided) */}
      {metadata && (
        <div style={{
          flexShrink: 0,
          padding: '2px 6px',
          backgroundColor: 'var(--background-color)',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 600,
          color: 'var(--emphasis-color)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {metadata}
        </div>
      )}

      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          color: 'var(--emphasis-color)',
          transition: 'color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-red)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--emphasis-color)'}
        aria-label="Dismiss suggestion"
      >
        <X size={14} strokeWidth={2.5} />
      </button>

      {/* Add button */}
      <div style={{ flexShrink: 0 }}>
        <ChevronButton
          variant="primary"
          onClick={onAdd}
          ariaLabel="Add suggestion"
          width="32px"
        >
          <Plus size={14} strokeWidth={2.5} />
        </ChevronButton>
      </div>
    </div>
  );
};

export default SuggestionCard;
