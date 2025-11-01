/**
 * MapSubtabs - Two-tab switcher for MAP and PLAN views within Mapper mode
 *
 * Features:
 * - Clean MAP/PLAN split navigation
 * - Theme-aware styling (Solarized colors)
 * - Active state highlighting
 * - Smooth transitions
 * - ADHD-friendly: reduces 5 tabs → 2 main subtabs
 *
 * Usage:
 * <MapSubtabs
 *   activeTab="map"
 *   onTabChange={(tab) => setActiveTab(tab)}
 * />
 */

'use client';

import React from 'react';

// ============================================================================
// Types
// ============================================================================

export type MapSubtab = 'map' | 'plan';

export interface MapSubtabsProps {
  activeTab: MapSubtab;
  onTabChange: (tab: MapSubtab) => void;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export default function MapSubtabs({
  activeTab,
  onTabChange,
  className = '',
}: MapSubtabsProps) {
  return (
    <div
      className={`map-subtabs ${className}`}
      style={{
        display: 'flex',
        gap: '8px',
        padding: '12px 16px',
        backgroundColor: '#073642',
        borderBottom: '1px solid #586e75',
      }}
    >
      {/* MAP Tab */}
      <button
        onClick={() => onTabChange('map')}
        className={`map-subtab ${activeTab === 'map' ? 'active' : ''}`}
        style={{
          flex: 1,
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: activeTab === 'map' ? 'bold' : 'normal',
          backgroundColor: activeTab === 'map' ? '#268bd2' : '#002b36',
          color: activeTab === 'map' ? '#fdf6e3' : '#586e75',
          border: activeTab === 'map' ? 'none' : '1px solid #586e75',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        <span style={{ fontSize: '16px' }}>🗺️</span>
        <span>MAP</span>
      </button>

      {/* PLAN Tab */}
      <button
        onClick={() => onTabChange('plan')}
        className={`map-subtab ${activeTab === 'plan' ? 'active' : ''}`}
        style={{
          flex: 1,
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: activeTab === 'plan' ? 'bold' : 'normal',
          backgroundColor: activeTab === 'plan' ? '#268bd2' : '#002b36',
          color: activeTab === 'plan' ? '#fdf6e3' : '#586e75',
          border: activeTab === 'plan' ? 'none' : '1px solid #586e75',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        <span style={{ fontSize: '16px' }}>🎯</span>
        <span>PLAN</span>
      </button>
    </div>
  );
}
