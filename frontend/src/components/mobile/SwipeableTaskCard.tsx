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
  onTap: (task: Task) => void;        // View details
  isActive: boolean;
}

const SwipeableTaskCard: React.FC<SwipeableTaskCardProps> = ({
  task,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  isActive
}) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 100;
  const MAX_DRAG = 150;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    
    // Limit drag distance
    const limitedDrag = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, diff));
    setDragX(limitedDrag);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      if (dragX > 0) {
        // Swipe right - Do Now / Delegate
        onSwipeRight(task);
      } else {
        // Swipe left - Dismiss
        onSwipeLeft(task);
      }
    }
    
    // Reset position
    setDragX(0);
  };

  const handleClick = () => {
    if (!isDragging && Math.abs(dragX) < 10) {
      onTap(task);
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-300 bg-white';
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
    <div className="relative w-full h-full overflow-hidden">
      {/* Background action indicators */}
      <div className="absolute inset-0 flex">
        {/* Left side - Dismiss */}
        <div className={`flex-1 flex items-center justify-start pl-6 bg-red-500 transition-opacity duration-200 ${
          dragX < -20 ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="text-white text-center">
            <div className="text-2xl mb-1">🗑️</div>
            <div className="text-sm font-medium">Dismiss</div>
          </div>
        </div>
        
        {/* Right side - Do Now / Delegate */}
        <div className={`flex-1 flex items-center justify-end pr-6 transition-opacity duration-200 ${
          isDigital ? 'bg-blue-500' : 'bg-green-500'
        } ${dragX > 20 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-white text-center">
            <div className="text-2xl mb-1">{isDigital ? '🤖' : '⚡'}</div>
            <div className="text-sm font-medium">{isDigital ? 'Delegate' : 'Do Now'}</div>
          </div>
        </div>
      </div>

      {/* Main task card */}
      <div
        ref={cardRef}
        className={`relative w-full h-full bg-white rounded-2xl shadow-lg border-2 transition-transform duration-200 ${
          getPriorityColor(task.priority)
        } ${isDragging ? 'transition-none' : ''}`}
        style={{
          transform: `translateX(${dragX}px)`,
          zIndex: isActive ? 10 : 1
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        {/* Card content */}
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">
                {task.title}
              </h2>
              {(task.description || task.desc) && (
                <p className="text-gray-600 text-sm leading-relaxed">
                  {task.description || task.desc}
                </p>
              )}
            </div>
            <div className="ml-4 flex flex-col items-end">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.priority || 'medium'}
              </span>
              <span className="text-xs text-gray-500 mt-1">
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
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                  +{task.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Context/Environment */}
          {task.context && (
            <div className="mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Context</span>
              <div className="text-sm text-gray-700 mt-1">{task.context}</div>
            </div>
          )}

          {/* Bottom section */}
          <div className="mt-auto">
            {/* Digital task indicator */}
            {isDigital && (
              <div className="flex items-center mb-3 p-2 bg-blue-50 rounded-lg">
                <span className="text-blue-500 mr-2">🤖</span>
                <span className="text-blue-700 text-sm font-medium">
                  Can be delegated to agents
                </span>
              </div>
            )}

            {/* Swipe instructions */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>← Swipe to dismiss</span>
              <span>Tap for details</span>
              <span>Swipe to {isDigital ? 'delegate' : 'do'} →</span>
            </div>
          </div>
        </div>

        {/* Drag indicator */}
        {isDragging && (
          <div className="absolute top-4 right-4">
            <div className={`w-3 h-3 rounded-full ${
              Math.abs(dragX) > SWIPE_THRESHOLD ? 
                (dragX > 0 ? 'bg-green-500' : 'bg-red-500') : 
                'bg-gray-300'
            }`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SwipeableTaskCard;
