'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { spacing, fontSize, semanticColors } from '@/lib/design-system';

interface TickerProps {
  autoMode: boolean;
  askForClarity: boolean;
  className?: string;
  isPaused?: boolean;
}

const Ticker: React.FC<TickerProps> = ({ autoMode, askForClarity, className = '', isPaused = false }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Define ticker messages based on toggle states with habit-forming psychology
  const getTickerMessages = () => {
    const baseMessages = {
      autoClarity: [
        "AI will process and ask clarifying questions...",
        "Smart capture with follow-up questions",
        "Auto-process with clarity checks",
        "Intelligent task breakdown coming up",
        "Your brain dump becomes actionable tasks",
        "AI magic: turning thoughts into micro-steps"
      ],
      autoOnly: [
        "AI will automatically process your task...",
        "Smart auto-capture mode active",
        "Automatic task processing enabled",
        "AI will handle the details for you",
        "Instant dopamine hit from task completion",
        "Like a productivity game - AI does the work!"
      ],
      clarityOnly: [
        "Manual mode with clarity questions...",
        "You'll be asked clarifying questions",
        "Manual processing with follow-up",
        "Interactive clarification flow",
        "Puzzle-solving mode: piece together your thoughts",
        "Your personal task detective"
      ],
      manual: [
        "Manual processing mode...",
        "You'll handle task processing",
        "Manual capture without AI assistance",
        "Direct task entry mode",
        "Full control - you're the captain",
        "Building your own productivity system"
      ]
    };

    // Add variable rewards and unpredictable elements
    const variableRewards = [
      "Bonus: You're building a habit!",
      "Streak potential detected",
      "Achievement unlocked: Task capture",
      "Surprise: This gets easier with practice",
      "Rare: You're optimizing your brain",
      "Pro tip: Capture prevents thought loss"
    ];

    // Add motivational dopamine triggers
    const motivationalHooks = [
      "Your future self will thank you",
      "Quick wins build momentum",
      "Small steps = big changes",
      "You're rewiring your brain for success",
      "Each capture is progress",
      "Building the habit of productivity"
    ];

    let messages = [];
    
    if (autoMode && askForClarity) {
      messages = baseMessages.autoClarity;
    } else if (autoMode && !askForClarity) {
      messages = baseMessages.autoOnly;
    } else if (!autoMode && askForClarity) {
      messages = baseMessages.clarityOnly;
    } else {
      messages = baseMessages.manual;
    }

    // Add variable rewards (20% chance)
    if (Math.random() < 0.2) {
      messages = [...messages, ...variableRewards];
    }

    // Add motivational hooks (30% chance)
    if (Math.random() < 0.3) {
      messages = [...messages, ...motivationalHooks];
    }

    return messages;
  };

  const messages = useMemo(() => getTickerMessages(), [autoMode, askForClarity]);

  // Reset ticker when toggles change
  useEffect(() => {
    setCurrentMessageIndex(0);
    setIsVisible(true);
    setIsTransitioning(false);
  }, [autoMode, askForClarity]);

  useEffect(() => {
    if (isPaused) return; // Don't start interval if paused
    
    let timeoutId: NodeJS.Timeout;
    let transitionTimeoutId: NodeJS.Timeout;
    let resetTimeoutId: NodeJS.Timeout;
    
    // More reasonable timing: 4-8 seconds with some variation
    const getRandomInterval = () => Math.random() * 4000 + 4000; // 4-8 seconds
    
    const scheduleNext = () => {
      const interval = getRandomInterval();
      timeoutId = setTimeout(() => {
        if (!isPaused) {
          setIsTransitioning(true);
          setIsVisible(false);
          
          transitionTimeoutId = setTimeout(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
            setIsVisible(true);
            
            resetTimeoutId = setTimeout(() => {
              setIsTransitioning(false);
              scheduleNext(); // Schedule the next change
            }, 300);
          }, 300);
        }
      }, interval);
    };

    scheduleNext();
    
    // Cleanup function
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (transitionTimeoutId) clearTimeout(transitionTimeoutId);
      if (resetTimeoutId) clearTimeout(resetTimeoutId);
    };
  }, [messages.length, isPaused]);

  return (
    <div 
      ref={tickerRef}
      className={`transition-all duration-300 ease-in-out ${className}`}
      style={{
        fontSize: fontSize.sm,
        color: semanticColors.text.secondary,
        fontStyle: 'italic',
        opacity: isVisible ? 1 : 0,
        transform: isTransitioning ? 'translateX(-10px)' : 'translateX(0)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
    >
      {messages[currentMessageIndex]}
    </div>
  );
};

export default Ticker;
