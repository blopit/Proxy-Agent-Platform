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
  description: string;
}

const SwipeableModeHeader: React.FC<SwipeableModeHeaderProps> = ({
  currentMode,
  onModeChange,
  energy
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Performance: Use refs for smooth dragging
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const velocityTrackerRef = useRef<Array<{x: number, time: number}>>([]);

  const modes: BioMode[] = [
    { id: 'hunter', name: 'Hunter', icon: '🎯', color: '#dc322f', description: 'Pursuit Flow' },
    { id: 'scout', name: 'Scout', icon: '🔍', color: '#859900', description: 'Seek Novelty' },
    { id: 'mender', name: 'Mender', icon: '🌱', color: '#268bd2', description: 'Recover Energy' },
    { id: 'mapper', name: 'Mapper', icon: '🗺️', color: '#6c71c4', description: 'Consolidate' },
    { id: 'rebirth', name: 'Rebirth', icon: '🦋', color: '#d33682', description: 'Transform' }
  ];

  const currentModeIndex = modes.findIndex(m => m.id === currentMode);
  const currentModeData = modes[currentModeIndex] || modes[0];

  const SWIPE_THRESHOLD = 60;
  const MAX_DRAG = 120;
  const VELOCITY_THRESHOLD = 0.25; // px/ms

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    currentXRef.current = 0;
    velocityTrackerRef.current = [];

    // Disable transitions for smooth dragging
    if (contentRef.current) {
      contentRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const diffX = touch.clientX - startXRef.current;

    // Start dragging if moved more than 5px
    if (Math.abs(diffX) > 5 && !isDragging) {
      setIsDragging(true);
    }

    // Track velocity for momentum (keep last 5 points)
    velocityTrackerRef.current.push({
      x: diffX,
      time: Date.now()
    });
    if (velocityTrackerRef.current.length > 5) {
      velocityTrackerRef.current.shift();
    }

    // Limit drag distance with smooth resistance at edges
    let limitedDrag = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, diffX));

    // Add resistance when dragging beyond threshold
    if (Math.abs(limitedDrag) > SWIPE_THRESHOLD) {
      const excess = Math.abs(limitedDrag) - SWIPE_THRESHOLD;
      const resistance = excess * 0.4; // 60% resistance
      limitedDrag = limitedDrag > 0
        ? SWIPE_THRESHOLD + resistance
        : -(SWIPE_THRESHOLD + resistance);
    }

    currentXRef.current = limitedDrag;

    // Direct DOM manipulation for 60fps smooth dragging
    if (contentRef.current) {
      contentRef.current.style.transform = `translateX(${limitedDrag}px)`;
      // Add slight opacity change for visual feedback
      const opacity = 1 - Math.abs(limitedDrag) / MAX_DRAG * 0.3;
      contentRef.current.style.opacity = `${opacity}`;
    }
  };

  const calculateVelocity = () => {
    const points = velocityTrackerRef.current;
    if (points.length < 2) return 0;

    const first = points[0];
    const last = points[points.length - 1];
    const deltaX = last.x - first.x;
    const deltaTime = last.time - first.time;

    return deltaTime > 0 ? deltaX / deltaTime : 0; // px/ms
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const velocity = calculateVelocity();
    const dragX = currentXRef.current;

    // Enable smooth transition for snap-back or mode change
    if (contentRef.current) {
      contentRef.current.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    // Check if swipe threshold met or velocity is high enough
    const shouldSwipe =
      Math.abs(dragX) > SWIPE_THRESHOLD ||
      Math.abs(velocity) > VELOCITY_THRESHOLD;

    if (shouldSwipe) {
      setShowTutorial(false); // Dismiss tutorial after first swipe
      setIsAnimating(true);

      const direction = dragX > 0 || velocity > 0 ? 'right' : 'left';

      if (direction === 'left') {
        // Swipe left - go to next mode
        const nextIndex = (currentModeIndex + 1) % modes.length;
        onModeChange(modes[nextIndex].id);
      } else {
        // Swipe right - go to previous mode
        const prevIndex = (currentModeIndex - 1 + modes.length) % modes.length;
        onModeChange(modes[prevIndex].id);
      }

      // Animate out quickly
      if (contentRef.current) {
        const exitDistance = direction === 'right' ? 100 : -100;
        contentRef.current.style.transform = `translateX(${exitDistance}px)`;
        contentRef.current.style.opacity = '0';
      }

      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.transform = 'translateX(0px)';
          contentRef.current.style.opacity = '1';
        }
        setIsAnimating(false);
      }, 300);
    } else {
      // Snap back to center
      if (contentRef.current) {
        contentRef.current.style.transform = 'translateX(0px)';
        contentRef.current.style.opacity = '1';
      }
    }

    setIsDragging(false);
    currentXRef.current = 0;
    velocityTrackerRef.current = [];
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-0 right-0 z-20 bg-[#002b36] border-t border-[#586e75] safe-area-bottom"
      style={{
        touchAction: 'none', // Prevent browser gestures
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Quick swipe instruction (dismisses after first swipe) */}
      {showTutorial && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 pb-2">
          <div className="text-[10px] text-[#586e75] whitespace-nowrap animate-pulse bg-[#002b36] px-3 py-1 rounded-full border border-[#586e75]">
            ← swipe to switch modes →
          </div>
        </div>
      )}

      {/* Swipe hint dots */}
      <div className="flex justify-center gap-1 pt-2">
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

      {/* Content with smooth swiping */}
      <div
        ref={contentRef}
        className="px-4 py-3 flex items-center justify-between"
        style={{
          transform: 'translateX(0px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform', // GPU acceleration
          opacity: 1
        }}
      >
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
          <div
            className="text-xs opacity-70 mt-0.5"
            style={{ color: currentModeData.color }}
          >
            {currentModeData.description}
          </div>
        </div>

        {/* Next mode indicator */}
        <div className="w-8 text-center opacity-40 text-sm">
          {currentModeIndex < modes.length - 1 ? modes[currentModeIndex + 1].icon : ''}
        </div>
      </div>
    </div>
  );
};

export default SwipeableModeHeader;
