'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { spacing, fontSize, semanticColors } from '@/lib/design-system';

interface PurposeTickerProps {
  activeTab: string;
  energy: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  className?: string;
}

const PurposeTicker: React.FC<PurposeTickerProps> = ({ 
  activeTab, 
  energy, 
  timeOfDay, 
  className = '' 
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Define contextual advice messages based on active tab and context with habit psychology
  const getContextualMessages = () => {
    const baseMessages = {
      capture: [
        "Capture thoughts instantly with natural language",
        "Just speak or type what's on your mind",
        "Don't overthink it - capture first, organize later",
        "Your brain dumps are valuable data",
        "Quick capture prevents thought loss",
        "Building the habit of instant capture",
        "Each capture = dopamine hit",
        "You're training your brain for productivity"
      ],
      scout: [
        "Seek novelty & identify doable micro-targets",
        "Look for small wins to build momentum",
        "Scan your environment for opportunities",
        "Find tasks that match your current energy",
        "Discovery mode: what can I tackle right now?",
        "Like a treasure hunt for productivity",
        "Small wins = big confidence boost",
        "You're building the habit of scanning"
      ],
      hunter: [
        "Enter pursuit flow and harvest reward",
        "Deep focus on one important task",
        "Channel your energy into meaningful work",
        "Hunt for progress, not perfection",
        "Flow state: where time disappears",
        "Your brain's reward system is activated",
        "This is where magic happens",
        "Building the habit of deep work"
      ],
      mender: [
        "Recover energy & rebuild cognitive tissue",
        "Take breaks to restore your mental energy",
        "Gentle activities that recharge you",
        "Self-care is productivity too",
        "Rest is not laziness - it's maintenance",
        "Your brain needs this to function",
        "Building the habit of self-care",
        "Recovery = better performance"
      ],
      mapper: [
        "Consolidate memory and recalibrate priorities",
        "Reflect on what you've learned today",
        "Plan tomorrow based on today's insights",
        "Connect the dots between your experiences",
        "Wisdom comes from reflection",
        "Your brain's consolidation phase",
        "Building the habit of reflection",
        "This is how you level up"
      ]
    };

    // Add contextual advice based on energy and time with habit psychology
    const contextualAdvice = [];
    
    if (energy < 30) {
      contextualAdvice.push("Your energy is low - consider gentle activities");
      contextualAdvice.push("Perfect time for self-care habits");
      contextualAdvice.push("Low energy = perfect for recovery mode");
    } else if (energy > 80) {
      contextualAdvice.push("High energy detected - tackle challenging tasks");
      contextualAdvice.push("Peak performance mode activated");
      contextualAdvice.push("Your brain is ready for deep work");
    }

    if (timeOfDay === 'morning') {
      contextualAdvice.push("Morning is your peak cognitive window");
      contextualAdvice.push("Fresh brain = maximum habit formation");
      contextualAdvice.push("Morning habits stick better");
    } else if (timeOfDay === 'afternoon') {
      contextualAdvice.push("Afternoon dip - focus on routine tasks");
      contextualAdvice.push("Perfect for building consistency");
      contextualAdvice.push("Routine tasks = habit reinforcement");
    } else if (timeOfDay === 'evening') {
      contextualAdvice.push("Evening reflection time - consolidate learning");
      contextualAdvice.push("Your brain is consolidating today's wins");
      contextualAdvice.push("Reflection = habit reinforcement");
    } else {
      contextualAdvice.push("Night mode - minimal cognitive load recommended");
      contextualAdvice.push("Rest is a productivity habit too");
      contextualAdvice.push("Recovery builds tomorrow's energy");
    }

    // Add variable rewards and gamification elements
    const variableRewards = [
      "Bonus: You're building neural pathways!",
      "Streak potential: Keep going!",
      "Achievement: You're optimizing your brain",
      "Surprise: This gets easier with practice",
      "Rare: You're rewiring for success",
      "Pro tip: Consistency beats perfection",
      "Level up: Each action strengthens habits",
      "Magic: Your brain is adapting"
    ];

    // Add motivational dopamine triggers
    const motivationalHooks = [
      "Your future self will thank you",
      "Small actions = big changes",
      "You're building the habit of productivity",
      "Each choice shapes your brain",
      "Progress over perfection",
      "You're stronger than you think",
      "Momentum builds momentum",
      "Life is a game - play to win"
    ];

    // Combine base messages with contextual advice
    const baseTabMessages = baseMessages[activeTab as keyof typeof baseMessages] || baseMessages.capture;
    let allMessages = [...baseTabMessages, ...contextualAdvice];

    // Add variable rewards (25% chance)
    if (Math.random() < 0.25) {
      allMessages = [...allMessages, ...variableRewards];
    }

    // Add motivational hooks (35% chance)
    if (Math.random() < 0.35) {
      allMessages = [...allMessages, ...motivationalHooks];
    }

    return allMessages;
  };

  const messages = useMemo(() => getContextualMessages(), [activeTab, energy, timeOfDay]);

  // Reset ticker when tab changes
  useEffect(() => {
    setCurrentMessageIndex(0);
    setIsVisible(true);
    setIsTransitioning(false);
  }, [activeTab]);

  useEffect(() => {
    // Variable timing for unpredictability (9-21 seconds - 3x slower)
    const getRandomInterval = () => Math.random() * 12000 + 9000; // 9-21 seconds
    
    const scheduleNext = () => {
      const interval = getRandomInterval();
      setTimeout(() => {
        setIsTransitioning(true);
        setIsVisible(false);
        
        setTimeout(() => {
          setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
          setIsVisible(true);
          setTimeout(() => {
            setIsTransitioning(false);
            scheduleNext(); // Schedule the next change
          }, 300);
        }, 300);
      }, interval);
    };

    scheduleNext();
  }, [messages.length]);

  return (
    <div 
      ref={tickerRef}
      className={`transition-all duration-300 ease-in-out ${className}`}
      style={{
        fontSize: fontSize.xs,
        color: semanticColors.text.secondary,
        fontStyle: 'italic',
        opacity: isVisible ? 1 : 0,
        transform: isTransitioning ? 'translateX(-5px)' : 'translateX(0)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '100%'
      }}
    >
      {messages[currentMessageIndex]}
    </div>
  );
};

export default PurposeTicker;
