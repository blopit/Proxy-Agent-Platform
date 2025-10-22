'use client'

import React, { useState, useEffect } from 'react';

interface SwipeableModeHeaderProps {
  currentMode: string;
  onModeChange: (mode: string) => void;
  energy: number;
}

interface BioMode {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const SwipeableModeHeader: React.FC<SwipeableModeHeaderProps> = ({
  currentMode,
  onModeChange,
  energy
}) => {
  const [isHydrated, setIsHydrated] = useState(false);

  const modes: BioMode[] = [
    { id: 'hunter', name: 'Hunter', icon: '🎯', color: '#dc322f', description: 'Pursuit Flow' },
    { id: 'scout', name: 'Scout', icon: '🔍', color: '#859900', description: 'Seek Novelty' },
    { id: 'mender', name: 'Mender', icon: '🌱', color: '#268bd2', description: 'Recover Energy' },
    { id: 'mapper', name: 'Mapper', icon: '🗺️', color: '#6c71c4', description: 'Consolidate' },
    { id: 'rebirth', name: 'Rebirth', icon: '🦋', color: '#d33682', description: 'Transform' }
  ];

  const currentModeIndex = modes.findIndex(m => m.id === currentMode);
  const currentModeData = modes[currentModeIndex] || modes[0];

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Prevent hydration mismatch by only rendering after hydration
  if (!isHydrated) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#002b36] border-t border-[#586e75] safe-area-bottom">
        <div className="px-4 py-2 flex items-center">
          <div className="text-2xl">🎯</div>
          <div className="flex-1 flex flex-col items-center">
            <div className="text-xs font-semibold text-gray-400">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#002b36] border-t border-[#586e75] safe-area-bottom">
      {/* Simple mode display - half height */}
      <div className="px-4 py-2 flex items-center">
        {/* Icon on left */}
        <div
          className="text-2xl"
          style={{
            filter: `drop-shadow(0 0 6px ${currentModeData.color}40)`
          }}
        >
          {currentModeData.icon}
        </div>
        
        {/* Text centered */}
        <div className="flex-1 flex flex-col items-center">
          <div
            className="text-xs font-semibold"
            style={{ color: currentModeData.color }}
          >
            {currentModeData.name}
          </div>
          <div
            className="text-[10px] opacity-70"
            style={{ color: currentModeData.color }}
          >
            {currentModeData.description}
          </div>
        </div>
      </div>

      {/* Mode indicators */}
      <div className="flex justify-center gap-1 pb-1 -mt-2">
        {modes.map((mode, idx) => (
          <div
            key={mode.id}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === currentModeIndex
                ? 'w-6 opacity-100'
                : 'w-1 opacity-30'
            }`}
            style={{
              backgroundColor: idx === currentModeIndex
                ? mode.color
                : '#586e75'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SwipeableModeHeader;
