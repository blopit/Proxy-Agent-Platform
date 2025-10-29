/**
 * MapSection - Full-screen snap-scroll section for MAP or PLAN content
 *
 * Features:
 * - Full viewport height with snap-scrolling
 * - Optional scroll hint at bottom
 * - Themed styling (Solarized)
 * - Automatic section ID for navigation
 * - ADHD-friendly: One section at a time, full focus
 *
 * Usage:
 * <div className="snap-y snap-mandatory overflow-y-auto">
 *   <MapSection id="stats" title="Dashboard" icon="📊">
 *     <StatsContent />
 *   </MapSection>
 *   <MapSection id="wins" title="Achievements" icon="🏆">
 *     <AchievementsContent />
 *   </MapSection>
 * </div>
 */

'use client';

import React, { ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface MapSectionProps {
  id: string;
  title?: string;
  icon?: string;
  children: ReactNode;
  showScrollHint?: boolean;
  scrollHintText?: string;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export default function MapSection({
  id,
  title,
  icon,
  children,
  showScrollHint = false,
  scrollHintText = 'Swipe down for more',
  className = '',
}: MapSectionProps) {
  return (
    <section
      id={id}
      className={`map-section ${className}`}
      style={{
        minHeight: '100vh',
        scrollSnapAlign: 'start',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        backgroundColor: '#002b36',
      }}
    >
      {/* Optional section header */}
      {(title || icon) && (
        <div
          style={{
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {icon && <span style={{ fontSize: '24px' }}>{icon}</span>}
          {title && (
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#93a1a1',
                margin: 0,
              }}
            >
              {title}
            </h3>
          )}
        </div>
      )}

      {/* Section content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {children}
      </div>

      {/* Optional scroll hint */}
      {showScrollHint && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '16px',
            paddingBottom: '8px',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              color: '#586e75',
              textAlign: 'center',
              animation: 'bounce 2s infinite',
            }}
          >
            <div style={{ marginBottom: '4px' }}>↓</div>
            <div>{scrollHintText}</div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </section>
  );
}
