# ADHD Task Management System

## Overview

This mobile-first ADHD task management system is designed based on biological circuits from `bio_reference.md`. It features swipeable task cards and biological attention metabolism tabs.

## Features

### 🧠 Biological Circuits (Tabs)

Based on the 4 core biological circuits from bio_reference.md:

1. **Scout** 🔍 - Forager/Primate mode
   - Purpose: Seek novelty & identify doable micro-targets
   - Optimal: Morning or afternoon with high energy

2. **Hunter** 🎯 - Predator mode  
   - Purpose: Enter pursuit flow and harvest reward
   - Optimal: Morning or when energy > 70%

3. **Mender** 🌱 - Herd/Parasympathetic mode
   - Purpose: Recover energy & rebuild cognitive tissue
   - Optimal: Afternoon or when energy < 40%

4. **Mapper** 🗺️ - Elder/Hippocampal replay mode
   - Purpose: Consolidate memory and recalibrate priorities
   - Optimal: Evening or night

### 📱 Swipeable Task Cards

Full-screen task cards with intuitive swipe gestures:

- **Swipe Left** ← - Dismiss task
- **Swipe Right** → - Do Now or Delegate to agents
- **Tap** - View task details

### 🤖 Smart Delegation

Digital tasks are automatically identified and can be delegated to the agent workflow system:

- Email tasks
- Research tasks  
- Coding tasks
- Online tasks
- Tasks tagged as 'digital'

### ⏰ Neuro-Clock

Automatic time-of-day detection that biases available biological states:

- **Morning**: Scout → Hunter heavy (optimal dopamine window)
- **Afternoon**: Mender micro-bursts recommended  
- **Evening**: Mapper reflections (consolidation time)
- **Night**: Rest mode - minimal cognitive load

## Components

### SwipeableTaskCard

Full-screen task card with touch gestures:
- Touch-optimized swipe detection
- Visual feedback for swipe directions
- Priority-based color coding
- Digital task indicators

### BiologicalTabs

Tab system based on attention metabolism:
- Pulse animations for optimal circuits
- Breathing circle animations
- Metabolic loop visualization
- Rare mutation state (5% chance)

## Usage

1. Navigate to `/mobile` page
2. Select biological circuit based on your current state
3. Swipe through tasks one at a time (ADHD-focused)
4. Use gestures to quickly process tasks:
   - Left swipe to dismiss
   - Right swipe to do now or delegate
   - Tap for details

## ADHD Optimizations

- **One task at a time** - Reduces overwhelm
- **Large touch targets** - Easy mobile interaction
- **Visual feedback** - Clear swipe indicators
- **Biological grounding** - Matches natural attention cycles
- **Quick processing** - 2-second decision making
- **Celebration system** - Dopamine rewards

## Integration

Connects to all backend services:
- Task Management API (`/api/v1/tasks/*`)
- Secretary/Delegation API (`/api/v1/secretary/*`)
- Focus Management API (`/api/v1/focus/*`)
- Energy Tracking API (`/api/v1/energy/*`)
- Gamification API (`/api/v1/gamification/*`)

## Files

- `page.tsx` - Main ADHD task manager component
- `SwipeableTaskCard.tsx` - Individual task card with gestures
- `BiologicalTabs.tsx` - Biological circuit tab system
- `mobile.css` - ADHD-specific mobile styles
- `README.md` - This documentation

## Future Enhancements

- Voice input for task capture
- Haptic feedback for swipe gestures
- Adaptive AI recommendations based on biological state
- Integration with wearable devices for energy tracking
- Mutation state workflows for major life transitions
