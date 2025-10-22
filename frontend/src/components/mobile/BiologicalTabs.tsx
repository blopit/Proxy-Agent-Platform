'use client'

import React, { useState, useEffect } from 'react';
import { Search, Target, Heart, Map, Sparkles } from 'lucide-react';

interface BiologicalTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  energy: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

interface BiologicalCircuit {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  description: string;
  purpose: string;
  color: string;
  bgColor: string;
  borderColor: string;
  isOptimal: boolean;
}

const BiologicalTabs: React.FC<BiologicalTabsProps> = ({
  activeTab,
  onTabChange,
  energy,
  timeOfDay
}) => {
  const [pulseAnimation, setPulseAnimation] = useState<string | null>(null);

  // Define the 5 biological circuits (added Capture mode first)
  const circuits: BiologicalCircuit[] = [
    {
      id: 'capture',
      name: 'Capture',
      icon: Sparkles,
      description: 'Quick Thought Capture',
      purpose: 'Capture thoughts instantly with natural language',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      isOptimal: true // Always available/optimal
    },
    {
      id: 'scout',
      name: 'Scout',
      icon: Search,
      description: 'Forager / Primate',
      purpose: 'Seek novelty & identify doable micro-targets',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      isOptimal: timeOfDay === 'morning' || (timeOfDay === 'afternoon' && energy > 60)
    },
    {
      id: 'hunter',
      name: 'Hunter',
      icon: Target,
      description: 'Predator',
      purpose: 'Enter pursuit flow and harvest reward',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      isOptimal: timeOfDay === 'morning' || (energy > 70)
    },
    {
      id: 'mender',
      name: 'Mender',
      icon: Heart,
      description: 'Herd / Parasympathetic',
      purpose: 'Recover energy & rebuild cognitive tissue',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      isOptimal: timeOfDay === 'afternoon' || energy < 40
    },
    {
      id: 'mapper',
      name: 'Mapper',
      icon: Map,
      description: 'Elder / Hippocampal replay',
      purpose: 'Consolidate memory and recalibrate priorities',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      isOptimal: timeOfDay === 'evening' || timeOfDay === 'night'
    }
  ];

  // Add optional mutation state (rare)
  const [showMutation, setShowMutation] = useState(false);
  
  useEffect(() => {
    // Rarely show mutation state after major accomplishments or burnout
    const shouldShowMutation = Math.random() < 0.05; // 5% chance
    setShowMutation(shouldShowMutation);
  }, []);

  // Pulse animation for optimal circuits
  useEffect(() => {
    const optimalCircuit = circuits.find(c => c.isOptimal && c.id === activeTab);
    if (optimalCircuit) {
      setPulseAnimation(optimalCircuit.id);
      const timer = setTimeout(() => setPulseAnimation(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [activeTab, timeOfDay, energy]);

  // Get neuro-clock recommendation
  const getNeuroClockRecommendation = () => {
    if (timeOfDay === 'morning') {
      return 'Scout → Hunter heavy (optimal dopamine window)';
    } else if (timeOfDay === 'afternoon') {
      return 'Mender micro-bursts recommended';
    } else if (timeOfDay === 'evening') {
      return 'Mapper reflections (consolidation time)';
    } else {
      return 'Rest mode - minimal cognitive load';
    }
  };

  // Breathing circle animation for active tab
  const getBreathingAnimation = (circuitId: string) => {
    if (activeTab === circuitId) {
      return 'animate-pulse';
    }
    return '';
  };

  return (
    <div className="w-full">
      {/* Mode description bar */}
      <div className="flex items-center justify-between px-4 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#268bd2] animate-pulse" />
          <span className="text-xs text-[#586e75]">
            {circuits.find(c => c.id === activeTab)?.purpose || 'Select a circuit'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#586e75]">{energy}%</span>
          <span className="text-xs text-[#586e75] capitalize">{timeOfDay}</span>
        </div>
      </div>

      {/* Bottom Navigation Tabs - Fill entire row with 5 tabs */}
      <div className="flex items-center justify-center gap-1 px-2">
        {circuits.map((circuit) => {
          const IconComponent = circuit.icon;
          return (
            <button
              key={circuit.id}
              onClick={() => onTabChange(circuit.id)}
              className={`
                relative flex-1 py-3 px-1 rounded-xl transition-all duration-300
                ${activeTab === circuit.id
                  ? 'bg-[#268bd2] text-[#fdf6e3] shadow-lg scale-105'
                  : 'bg-[#073642] text-[#586e75] border border-[#586e75]'
                }
                ${circuit.isOptimal && circuit.id !== 'capture' ? 'ring-2 ring-[#b58900] ring-opacity-50' : ''}
                ${pulseAnimation === circuit.id ? 'animate-pulse' : ''}
              `}
            >
              {/* Optimal indicator (not for capture since it's always optimal) */}
              {circuit.isOptimal && circuit.id !== 'capture' && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#b58900] rounded-full animate-ping" />
              )}

              {/* Circuit icon */}
              <div className="flex justify-center mb-1">
                <IconComponent size={18} className="transition-transform duration-300" />
              </div>

              {/* Circuit name */}
              <div className="text-xs font-medium text-center whitespace-nowrap">
                {circuit.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BiologicalTabs;
