'use client'

import React, { useState, useRef, useEffect } from 'react';

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

interface SwipeableTaskCardProps {
  task: Task;
  onSwipeLeft: (task: Task) => void;  // Dismiss
  onSwipeRight: (task: Task) => void; // Do Now / Delegate
  onTap: (task: Task) => void;        // View details (from hold gesture)
  isActive: boolean;
}

const SwipeableTaskCard: React.FC<SwipeableTaskCardProps> = ({
  task,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  isActive
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [holdPosition, setHoldPosition] = useState({ x: 0, y: 0 });
  const [showSwipeTutorial, setShowSwipeTutorial] = useState(true);
  const [showHoldTutorial, setShowHoldTutorial] = useState(true);

  const cardRef = useRef<HTMLDivElement>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdProgressInterval = useRef<NodeJS.Timeout | null>(null);

  // Performance: Use refs instead of state for values that don't need re-renders
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const currentXRef = useRef(0);
  const velocityTrackerRef = useRef<Array<{x: number, time: number}>>([]);

  const SWIPE_THRESHOLD = 100;
  const MAX_DRAG = 150;
  const HOLD_DURATION = 1000; // 1 second
  const VELOCITY_THRESHOLD = 0.3; // px/ms

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    currentXRef.current = 0;
    velocityTrackerRef.current = [];
    setHoldPosition({ x: touch.clientX, y: touch.clientY });

    // Disable transitions for smooth dragging
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }

    // Start hold timer
    setIsHolding(true);
    setHoldProgress(0);

    let progress = 0;
    holdProgressInterval.current = setInterval(() => {
      progress += 50;
      setHoldProgress((progress / HOLD_DURATION) * 100);
    }, 50);

    holdTimerRef.current = setTimeout(() => {
      // Hold completed - show details
      setShowHoldTutorial(false);
      onTap(task);
      cancelHold();
    }, HOLD_DURATION);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling while swiping

    const touch = e.touches[0];
    const diffX = touch.clientX - startXRef.current;
    const diffY = Math.abs(touch.clientY - startYRef.current);

    // If moved more than 10px in any direction, cancel hold
    if (Math.abs(diffX) > 10 || diffY > 10) {
      cancelHold();
      if (!isDragging) {
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
        const resistance = excess * 0.3; // 70% resistance
        limitedDrag = limitedDrag > 0
          ? SWIPE_THRESHOLD + resistance
          : -(SWIPE_THRESHOLD + resistance);
      }

      currentXRef.current = limitedDrag;

      // Direct DOM manipulation for 60fps smooth dragging
      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(${limitedDrag}px)`;
      }
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
    cancelHold();

    if (isDragging) {
      const velocity = calculateVelocity();
      const dragX = currentXRef.current;

      // Enable smooth transition for snap-back
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      }

      // Check if swipe threshold met or velocity is high enough
      const shouldSwipe =
        Math.abs(dragX) > SWIPE_THRESHOLD ||
        Math.abs(velocity) > VELOCITY_THRESHOLD;

      if (shouldSwipe) {
        setShowSwipeTutorial(false); // Dismiss tutorial after first swipe

        const direction = dragX > 0 || velocity > 0 ? 'right' : 'left';

        // Animate card off screen
        if (cardRef.current) {
          const exitDistance = direction === 'right' ? 400 : -400;
          cardRef.current.style.transform = `translateX(${exitDistance}px)`;
        }

        // Call the appropriate handler after animation
        setTimeout(() => {
          if (direction === 'right') {
            onSwipeRight(task);
          } else {
            onSwipeLeft(task);
          }
        }, 300);
      } else {
        // Snap back to center
        if (cardRef.current) {
          cardRef.current.style.transform = 'translateX(0px)';
        }
      }

      setIsDragging(false);
      currentXRef.current = 0;
      velocityTrackerRef.current = [];
    }
  };

  const cancelHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdProgressInterval.current) {
      clearInterval(holdProgressInterval.current);
      holdProgressInterval.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  useEffect(() => {
    return () => {
      cancelHold();
    };
  }, []);

  // Get priority color (Solarized)
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'border-[#dc322f] bg-[#073642]';
      case 'medium':
        return 'border-[#b58900] bg-[#073642]';
      case 'low':
        return 'border-[#859900] bg-[#073642]';
      default:
        return 'border-[#586e75] bg-[#073642]';
    }
  };

  // Get estimated time display
  const getTimeDisplay = () => {
    if (task.estimated_hours) {
      if (task.estimated_hours < 1) {
        return `${Math.round(task.estimated_hours * 60)}min`;
      }
      return `${task.estimated_hours}h`;
    }
    return '~15min';
  };

  // Determine if task is digital (can be delegated to agents)
  const isDigital = task.is_digital ||
    task.tags?.some(tag => ['digital', 'online', 'email', 'research', 'coding'].includes(tag.toLowerCase())) ||
    task.title.toLowerCase().includes('email') ||
    task.title.toLowerCase().includes('research') ||
    task.title.toLowerCase().includes('code');

  return (
    <>
      {/* Swipe tutorials - FIXED position, clearly outside card */}
      {showSwipeTutorial && (
        <>
          <div className="fixed top-1/3 left-4 pointer-events-none z-40 animate-pulse">
            <div className="bg-[#dc322f] text-[#fdf6e3] px-4 py-3 rounded-lg text-sm font-medium shadow-lg">
              ← Swipe to dismiss
            </div>
          </div>
          <div className="fixed top-1/3 right-4 pointer-events-none z-40 animate-pulse">
            <div className={`${isDigital ? 'bg-[#268bd2]' : 'bg-[#859900]'} text-[#fdf6e3] px-4 py-3 rounded-lg text-sm font-medium shadow-lg`}>
              Swipe to {isDigital ? 'delegate' : 'do'} →
            </div>
          </div>
        </>
      )}

      {/* Hold tutorial - FIXED position at top of screen */}
      {showHoldTutorial && !isHolding && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 pointer-events-none z-40 animate-pulse">
          <div className="bg-[#6c71c4] text-[#fdf6e3] px-5 py-3 rounded-full text-sm font-medium shadow-lg whitespace-nowrap">
            👆 Hold for details
          </div>
        </div>
      )}

      <div className="relative w-full h-full overflow-visible">

      {/* Hold ring animation */}
      {isHolding && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: holdPosition.x,
            top: holdPosition.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <svg width="80" height="80" className="transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="30"
              fill="none"
              stroke="#586e75"
              strokeWidth="3"
              opacity="0.3"
            />
            <circle
              cx="40"
              cy="40"
              r="30"
              fill="none"
              stroke="#268bd2"
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 30}`}
              strokeDashoffset={`${2 * Math.PI * 30 * (1 - holdProgress / 100)}`}
              className="transition-all duration-50"
            />
          </svg>
        </div>
      )}

      {/* Background action indicators */}
      <div className="absolute inset-0 flex rounded-2xl overflow-hidden">
        {/* Left side - Dismiss */}
        <div className={`flex-1 flex items-center justify-start pl-6 bg-[#dc322f] transition-opacity duration-200 ${
          dragX < -20 ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="text-[#fdf6e3] text-center">
            <div className="text-2xl mb-1">🗑️</div>
            <div className="text-sm font-medium">Dismiss</div>
          </div>
        </div>

        {/* Right side - Do Now / Delegate */}
        <div className={`flex-1 flex items-center justify-end pr-6 transition-opacity duration-200 ${
          isDigital ? 'bg-[#268bd2]' : 'bg-[#859900]'
        } ${dragX > 20 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-[#fdf6e3] text-center">
            <div className="text-2xl mb-1">{isDigital ? '🤖' : '⚡'}</div>
            <div className="text-sm font-medium">{isDigital ? 'Delegate' : 'Do Now'}</div>
          </div>
        </div>
      </div>

      {/* Main task card */}
      <div
        ref={cardRef}
        className={`relative w-full h-full rounded-2xl shadow-lg border-2 ${
          getPriorityColor(task.priority)
        }`}
        style={{
          transform: 'translateX(0px)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          touchAction: 'none', // Prevent browser gestures
          willChange: 'transform', // GPU acceleration
          WebkitUserSelect: 'none',
          userSelect: 'none',
          zIndex: isActive ? 10 : 1
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Card content */}
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#93a1a1] leading-tight mb-2">
                {task.title}
              </h2>
              {(task.description || task.desc) && (
                <p className="text-[#586e75] text-sm leading-relaxed">
                  {task.description || task.desc}
                </p>
              )}
            </div>
            <div className="ml-4 flex flex-col items-end">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                task.priority === 'high' ? 'bg-[#dc322f] text-[#fdf6e3]' :
                task.priority === 'medium' ? 'bg-[#b58900] text-[#fdf6e3]' :
                'bg-[#859900] text-[#fdf6e3]'
              }`}>
                {task.priority || 'medium'}
              </span>
              <span className="text-xs text-[#586e75] mt-1">
                {getTimeDisplay()}
              </span>
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {task.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-[#002b36] text-[#93a1a1] rounded-full text-xs border border-[#586e75]"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="px-2 py-1 bg-[#002b36] text-[#586e75] rounded-full text-xs border border-[#586e75]">
                  +{task.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Context/Environment */}
          {task.context && (
            <div className="mb-4">
              <span className="text-xs text-[#586e75] uppercase tracking-wide">Context</span>
              <div className="text-sm text-[#93a1a1] mt-1">{task.context}</div>
            </div>
          )}

          {/* Bottom section */}
          <div className="mt-auto">
            {/* Digital task indicator */}
            {isDigital && (
              <div className="flex items-center p-2 bg-[#002b36] rounded-lg border border-[#268bd2]">
                <span className="text-[#268bd2] mr-2">🤖</span>
                <span className="text-[#268bd2] text-sm font-medium">
                  Can be delegated to agents
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Drag indicator */}
        {isDragging && (
          <div className="absolute top-4 right-4">
            <div className={`w-3 h-3 rounded-full ${
              Math.abs(currentXRef.current) > SWIPE_THRESHOLD ?
                (currentXRef.current > 0 ? 'bg-[#859900]' : 'bg-[#dc322f]') :
                'bg-[#586e75]'
            }`} />
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default SwipeableTaskCard;
