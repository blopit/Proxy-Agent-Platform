'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { spacing, fontSize, semanticColors } from '@/lib/design-system';

interface TickerProps {
  autoMode?: boolean;
  askForClarity?: boolean;
  className?: string;
  isPaused?: boolean;
  mode?: 'inbox' | 'today' | 'progress' | 'search' | 'capture' | 'scout' | 'hunter' | 'mender' | 'mapper'; // Support both old and new MVP modes
  messages?: string[];
  intervalMin?: number; // Minimum interval in milliseconds
  intervalMax?: number; // Maximum interval in milliseconds
}

const Ticker: React.FC<TickerProps> = ({
  autoMode = true,
  askForClarity = false,
  className = '',
  isPaused = false,
  mode = 'inbox', // MVP: Default to inbox
  messages: customMessages,
  intervalMin = 4000,
  intervalMax = 8000
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Define ticker messages based on toggle states and mode
  const getTickerMessages = () => {
    // Mode-specific agent messages
    const agentMessages = {
      // MVP Modes
      inbox: {
        autoClarity: [
          "Inbox: Drop your thoughts, I'll organize them...",
          "Brain dump mode - AI cleanup included",
          "Your thoughts → Actionable tasks",
          "Instant capture with smart follow-up"
        ],
        autoOnly: [
          "Inbox: I'll handle the details automatically...",
          "Just type it - I'll process it",
          "Auto-capture mode active",
          "Thoughts → Tasks (instantly)"
        ],
        clarityOnly: [
          "Inbox: I'll ask questions to clarify...",
          "Interactive capture with follow-up",
          "Let's refine your thoughts together"
        ],
        manual: [
          "Inbox: Ready for manual entry...",
          "Direct task capture mode",
          "Type your task as-is"
        ]
      },
      today: {
        autoClarity: [],
        autoOnly: [],
        clarityOnly: [],
        manual: []
      },
      progress: {
        autoClarity: [],
        autoOnly: [],
        clarityOnly: [],
        manual: []
      },
      // Legacy modes
      capture: {
        autoClarity: [
          "Capture Agent: Drop your thoughts, I'll organize them...",
          "I'll capture and ask clarifying questions",
          "Brain dump mode - AI cleanup included",
          "Your thoughts → Actionable tasks",
          "Instant capture with smart follow-up"
        ],
        autoOnly: [
          "Capture Agent: I'll handle the details automatically...",
          "Just type it - I'll process it",
          "Auto-capture mode active",
          "Thoughts → Tasks (instantly)",
          "AI-powered task creation"
        ],
        clarityOnly: [
          "Capture Agent: I'll ask questions to clarify...",
          "Interactive capture with follow-up",
          "Let's refine your thoughts together",
          "Clarity-first capture mode"
        ],
        manual: [
          "Capture Agent: Ready for manual entry...",
          "Direct task capture mode",
          "Type your task as-is",
          "Manual capture active"
        ]
      },
      scout: {
        autoClarity: [
          "Scout Agent: Ask me anything about your tasks...",
          "I'll search and ask for more details",
          "Smart search with follow-up",
          "Find tasks + get clarity",
          "Discover and refine together"
        ],
        autoOnly: [
          "Scout Agent: I'll find what you're looking for...",
          "Auto-search mode active",
          "Smart task discovery",
          "Ask and I'll scout for answers",
          "AI-powered task search"
        ],
        clarityOnly: [
          "Scout Agent: Let's explore your tasks together...",
          "Interactive search with questions",
          "Discovery mode with clarification",
          "I'll help you find what you need"
        ],
        manual: [
          "Scout Agent: Manual search mode...",
          "Direct task search",
          "Find your tasks manually",
          "Search mode active"
        ]
      }
    };

    const currentAgentMessages = agentMessages[mode as keyof typeof agentMessages] || agentMessages.inbox;

    const baseMessages = {
      autoClarity: currentAgentMessages.autoClarity,
      autoOnly: currentAgentMessages.autoOnly,
      clarityOnly: currentAgentMessages.clarityOnly,
      manual: currentAgentMessages.manual
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

  const messages = useMemo(() => {
    // Use custom messages if provided, otherwise generate based on mode/toggles
    return customMessages || getTickerMessages();
  }, [customMessages, autoMode, askForClarity, mode]);

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
    
    // Configurable timing with variation
    const getRandomInterval = () => Math.random() * (intervalMax - intervalMin) + intervalMin;
    
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
  }, [messages.length, isPaused, intervalMin, intervalMax]);

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
