'use client'

import React, { useState, useRef, useEffect } from 'react';

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
}

const SwipeableModeHeader: React.FC<SwipeableModeHeaderProps> = ({
  currentMode,
  onModeChange,
  energy
}) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const modes: BioMode[] = [
    { id: 'hunter', name: 'Hunter', icon: '🎯', color: '#dc322f' },
    { id: 'scout', name: 'Scout', icon: '🔍', color: '#859900' },
    { id: 'mender', name: 'Mender', icon: '🌱', color: '#268bd2' },
    { id: 'mapper', name: 'Mapper', icon: '🗺️', color: '#6c71c4' },
    { id: 'rebirth', name: 'Rebirth', icon: '🦋', color: '#d33682' }
  ];

  const currentModeIndex = modes.findIndex(m => m.id === currentMode);
  const currentModeData = modes[currentModeIndex] || modes[0];

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);

      if (isLeftSwipe) {
        // Swipe left - go to next mode
        const nextIndex = (currentModeIndex + 1) % modes.length;
        onModeChange(modes[nextIndex].id);
      } else if (isRightSwipe) {
        // Swipe right - go to previous mode
        const prevIndex = (currentModeIndex - 1 + modes.length) % modes.length;
        onModeChange(modes[prevIndex].id);
      }
    }
  };

  return (
    <div
      className="sticky top-0 z-20 bg-[#002b36] border-b border-[#586e75]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Previous mode indicator */}
        <div className="w-8 text-center opacity-40 text-sm">
          {currentModeIndex > 0 ? modes[currentModeIndex - 1].icon : ''}
        </div>

        {/* Current mode */}
        <div
          className={`flex-1 flex flex-col items-center transition-all duration-300 ${
            isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
          }`}
        >
          <div
            className="text-3xl mb-1"
            style={{
              filter: `drop-shadow(0 0 8px ${currentModeData.color}40)`
            }}
          >
            {currentModeData.icon}
          </div>
          <div
            className="text-sm font-semibold"
            style={{ color: currentModeData.color }}
          >
            {currentModeData.name}
          </div>
        </div>

        {/* Next mode indicator */}
        <div className="w-8 text-center opacity-40 text-sm">
          {currentModeIndex < modes.length - 1 ? modes[currentModeIndex + 1].icon : ''}
        </div>
      </div>

      {/* Swipe hint dots */}
      <div className="flex justify-center gap-1 pb-2">
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
                ? currentModeData.color
                : '#586e75'
            }}
          />
        ))}
      </div>

      {/* Quick swipe instruction (first time hint) */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
        <div className="text-[10px] text-[#586e75] whitespace-nowrap mt-1 animate-pulse">
          ← swipe to switch modes →
        </div>
      </div>
    </div>
  );
};

export default SwipeableModeHeader;
