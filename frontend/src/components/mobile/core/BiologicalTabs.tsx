'use client'

import React, { useState, useEffect } from 'react';
import { Search, Target, Heart, Map, Plus, Flame } from 'lucide-react';
import ChevronStep, { ChevronPosition } from './ChevronStep';

interface BiologicalTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  energy: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  showLabels?: boolean; // Default false for mobile-first icon-only display
}

interface BiologicalCircuit {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  description: string;
  purpose: string;
  isOptimal: boolean;
}

const BiologicalTabs: React.FC<BiologicalTabsProps> = ({
  activeTab,
  onTabChange,
  energy,
  timeOfDay,
  showLabels = false // Mobile-first: icon-only by default
}) => {
  // Define the 5 biological circuits in order: Add, Scout, Hunt, Recharge, Map
  const circuits: BiologicalCircuit[] = [
    {
      id: 'add',
      name: 'Add',
      icon: Plus,
      description: 'Quick Thought Capture',
      purpose: 'Capture thoughts instantly with natural language',
      isOptimal: true // Always available/optimal
    },
    {
      id: 'scout',
      name: 'Scout',
      icon: Search,
      description: 'Forager / Primate',
      purpose: 'Seek novelty & identify doable micro-targets',
      isOptimal: timeOfDay === 'morning' || (timeOfDay === 'afternoon' && energy > 60)
    },
    {
      id: 'hunt',
      name: 'Hunt',
      icon: Target,
      description: 'Predator',
      purpose: 'Enter pursuit flow and harvest reward',
      isOptimal: timeOfDay === 'morning' || (energy > 70)
    },
    {
      id: 'recharge',
      name: 'Recharge',
      icon: Heart,
      description: 'Herd / Parasympathetic',
      purpose: 'Recover energy & rebuild cognitive tissue',
      isOptimal: timeOfDay === 'afternoon' || energy < 40
    },
    {
      id: 'map',
      name: 'Map',
      icon: Map,
      description: 'Elder / Hippocampal replay',
      purpose: 'Consolidate memory and recalibrate priorities',
      isOptimal: timeOfDay === 'evening' || timeOfDay === 'night'
    }
  ];

  // Determine chevron position based on index
  const getPosition = (index: number, total: number): ChevronPosition => {
    if (index === 0) return 'first';
    if (index === total - 1) return 'last';
    return 'middle';
  };

  return (
    <div className="w-full">
      {/* ChevronStep Tab Bar */}
      <div className="flex items-stretch gap-0" style={{ height: '40px' }}>
        {circuits.map((circuit, index) => {
          const IconComponent = circuit.icon;
          const isActive = activeTab === circuit.id;

          return (
            <div key={circuit.id} style={{ flex: 1, position: 'relative' }}>
              <ChevronStep
                status={isActive ? 'active_tab' : 'tab'}
                position={getPosition(index, circuits.length)}
                size="micro"
                onClick={() => onTabChange(circuit.id)}
                ariaLabel={`${circuit.name} - ${circuit.description}`}
                width="100%"
              >
                {showLabels ? (
                  // Icon + Label (for wider displays)
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                    padding: '0 4px'
                  }}>
                    <IconComponent size={16} strokeWidth={2.5} />
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em',
                      whiteSpace: 'nowrap'
                    }}>
                      {circuit.name}
                    </span>
                  </div>
                ) : (
                  // Icon only (mobile-first default)
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconComponent size={18} strokeWidth={2.5} />
                  </div>
                )}
              </ChevronStep>

              {/* Optimal indicator - subtle golden dot above chevron */}
              {circuit.isOptimal && !isActive && circuit.id !== 'add' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '6px',
                    height: '6px',
                    background: '#b58900',
                    borderRadius: '50%',
                    boxShadow: '0 0 4px rgba(181, 137, 0, 0.6)',
                    zIndex: 10,
                    animation: 'pulse-optimal 2s ease-in-out infinite'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* CSS for optimal indicator pulse */}
      <style jsx>{`
        @keyframes pulse-optimal {
          0%, 100% {
            opacity: 0.7;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateX(-50%) scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default BiologicalTabs;
