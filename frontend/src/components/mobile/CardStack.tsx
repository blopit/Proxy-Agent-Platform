'use client'

import React, { useState, useEffect } from 'react';
import SwipeableTaskCard from './SwipeableTaskCard';

interface Task {
  task_id?: string;
  id?: number;
  title: string;
  description?: string;
  desc?: string;
  status: string;
  priority: string;
  context?: string;
  tone?: string;
  done?: boolean;
  created_at?: string;
  estimated_hours?: number;
  tags?: string[];
  is_digital?: boolean;
}

interface CardStackProps {
  tasks: Task[];
  onSwipeLeft: (task: Task) => void;
  onSwipeRight: (task: Task) => void;
  onTap: (task: Task) => void;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

const CardStack: React.FC<CardStackProps> = ({
  tasks,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  currentIndex,
  onIndexChange,
  onDismissSwipeTutorial,
  onDismissHoldTutorial
}) => {
  const [animatingCard, setAnimatingCard] = useState<number | null>(null);

  // Get visible cards (current + next 2)
  const visibleCards = tasks.slice(currentIndex, currentIndex + 3);

  const handleSwipe = (task: Task, direction: 'left' | 'right') => {
    setAnimatingCard(currentIndex);

    // Call the appropriate handler
    if (direction === 'left') {
      onSwipeLeft(task);
    } else {
      onSwipeRight(task);
    }

    // Move to next card after animation
    setTimeout(() => {
      onIndexChange(currentIndex + 1);
      setAnimatingCard(null);
    }, 300);
  };

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-xl font-bold text-[#93a1a1] mb-2">All caught up!</h2>
          <p className="text-[#586e75]">No tasks in your current biological mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" style={{ perspective: '1200px' }}>
      <div className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden">
        <div className="relative w-full max-w-md h-full max-h-[500px]">
          {visibleCards.map((task, index) => {
            const actualIndex = currentIndex + index;
            const isAnimating = animatingCard === actualIndex;

            // Calculate stack position
            const scale = 1 - (index * 0.05);
            const translateY = index * 10;
            const translateZ = -index * 20;
            const opacity = index === 0 ? 1 : 0.7 - (index * 0.2);

            return (
              <div
                key={task.task_id || task.id || actualIndex}
                className="absolute inset-0 transition-all duration-300 ease-out"
                style={{
                  transform: `
                    translateY(${translateY}px)
                    translateZ(${translateZ}px)
                    scale(${scale})
                  `,
                  transformStyle: 'preserve-3d',
                  opacity: opacity,
                  zIndex: 100 - index,
                  pointerEvents: index === 0 ? 'auto' : 'none',
                  filter: index > 0 ? `blur(${index}px)` : 'none'
                }}
              >
                <SwipeableTaskCard
                  task={task}
                  onSwipeLeft={(t) => handleSwipe(t, 'left')}
                  onSwipeRight={(t) => handleSwipe(t, 'right')}
                  onTap={onTap}
                  isActive={index === 0}
                  onDismissSwipeTutorial={onDismissSwipeTutorial}
                  onDismissHoldTutorial={onDismissHoldTutorial}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Card progress indicator - moved up from bottom */}
      {tasks.length > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-[#002b36] rounded-full px-4 py-2 shadow-lg border border-[#586e75]">
            <span className="text-sm font-medium text-[#93a1a1]">
              {currentIndex + 1} of {tasks.length}
            </span>
          </div>
        </div>
      )}

      {/* Swipe hints overlay (only show on first card) */}
      {currentIndex === 0 && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-40 animate-pulse pointer-events-none">
          <div className="bg-[#268bd2] text-[#fdf6e3] px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            👈 Swipe to interact 👉
          </div>
        </div>
      )}
    </div>
  );
};

export default CardStack;
