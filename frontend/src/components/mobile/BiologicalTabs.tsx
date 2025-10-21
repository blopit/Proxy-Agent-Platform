'use client'

import React, { useState, useEffect } from 'react';

interface BiologicalTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  energy: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

interface BiologicalCircuit {
  id: string;
  name: string;
  icon: string;
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

  // Define the 4 core biological circuits from bio_reference.md
  const circuits: BiologicalCircuit[] = [
    {
      id: 'scout',
      name: 'Scout',
      icon: '🔍',
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
      icon: '🎯',
      description: 'Predator',
      purpose: 'Enter pursuit flow and harvest reward',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      isOptimal: timeOfDay === 'morning' || (energy > 70)
    },
    {
      id: 'healer',
      name: 'Healer',
      icon: '🌱',
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
      icon: '🗺️',
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
      return 'Healer micro-bursts recommended';
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
      {/* Neuro-Clock Header */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Neuro-Clock</span>
          <span className="text-xs text-gray-500 capitalize">{timeOfDay}</span>
        </div>
        <p className="text-xs text-gray-600">{getNeuroClockRecommendation()}</p>
      </div>

      {/* Biological Circuit Tabs */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {circuits.map((circuit) => (
          <button
            key={circuit.id}
            onClick={() => onTabChange(circuit.id)}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-300 text-left
              ${activeTab === circuit.id 
                ? `${circuit.bgColor} ${circuit.borderColor} ${circuit.color} shadow-lg scale-105` 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }
              ${circuit.isOptimal ? 'ring-2 ring-yellow-300 ring-opacity-50' : ''}
              ${pulseAnimation === circuit.id ? 'animate-pulse' : ''}
            `}
          >
            {/* Optimal indicator */}
            {circuit.isOptimal && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
            )}

            {/* Circuit icon with breathing animation */}
            <div className={`text-2xl mb-2 ${getBreathingAnimation(circuit.id)}`}>
              {circuit.icon}
            </div>

            {/* Circuit name */}
            <div className="font-semibold text-sm mb-1">
              {circuit.name}
            </div>

            {/* Circuit description */}
            <div className="text-xs opacity-75 mb-2">
              {circuit.description}
            </div>

            {/* Purpose (shown only for active tab) */}
            {activeTab === circuit.id && (
              <div className="text-xs font-medium mt-2 p-2 bg-white bg-opacity-50 rounded">
                {circuit.purpose}
              </div>
            )}

            {/* Metabolic flow indicator */}
            {activeTab === circuit.id && (
              <div className="absolute bottom-1 right-1">
                <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Mutation State (rare) */}
      {showMutation && (
        <div className="mb-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
          <div className="flex items-center mb-2">
            <span className="text-lg mr-2">🦋</span>
            <span className="text-sm font-medium text-purple-700">Mutation State</span>
          </div>
          <p className="text-xs text-purple-600">
            Metamorphic reset available - reflection, redesign of habits, symbolic shedding of old patterns
          </p>
          <button
            onClick={() => onTabChange('mutation')}
            className="mt-2 px-3 py-1 bg-purple-500 text-white text-xs rounded-full hover:bg-purple-600 transition-colors"
          >
            Enter Rebirth Mode
          </button>
        </div>
      )}

      {/* Metabolic Loop Visualization */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs font-medium text-gray-700 mb-2">Attention Metabolism</div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className={activeTab === 'scout' ? 'text-emerald-600 font-medium' : ''}>Scout</span>
          <span>→</span>
          <span className={activeTab === 'hunter' ? 'text-red-600 font-medium' : ''}>Hunter</span>
          <span>→</span>
          <span className={activeTab === 'healer' ? 'text-blue-600 font-medium' : ''}>Healer</span>
          <span>→</span>
          <span className={activeTab === 'mapper' ? 'text-purple-600 font-medium' : ''}>Mapper</span>
          <span>↺</span>
        </div>
        
        {/* Current phase indicator */}
        <div className="mt-2 text-xs text-gray-600">
          <span className="font-medium">Current:</span> {circuits.find(c => c.id === activeTab)?.purpose || 'Select a circuit'}
        </div>
      </div>

      {/* Energy Level Indicator */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Energy: {energy}%</span>
        <span>Optimal circuits highlighted</span>
      </div>
    </div>
  );
};

export default BiologicalTabs;
