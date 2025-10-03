# Proxy Agent Platform

A personal productivity platform built with [PydanticAI](https://ai.pydantic.dev/) and [CopilotKit](https://copilotkit.ai). This system deploys specialized AI proxy agents to handle personal productivity tasks with real-time progress tracking, mobile integration, and gamification for ADHD/overwhelmed professionals.

## 🎯 Vision

The Proxy Agent Platform is designed to be your personal productivity command center where AI agents act as your proxies to:

- **Capture Tasks Instantly**: 2-second task capture via mobile shortcuts, wearables, and voice
- **Delegate Automatically**: AI agents handle routine tasks, scheduling, and follow-ups
- **Gamify Productivity**: XP, streaks, and rewards to maintain motivation
- **Adapt to You**: Learn your patterns and optimize for your energy levels
- **Mobile-First**: Seamless integration with iOS Shortcuts, Android tiles, and wearables
- **Zero Friction**: Micro-interactions designed for overwhelmed professionals

## 🚀 Key Features

### Proxy Agent Types
- **Task Proxy**: Handles micro-task capture, delegation, and completion tracking
- **Focus Proxy**: Manages attention, blocks distractions, and optimizes focus sessions
- **Energy Proxy**: Tracks energy levels, suggests optimal timing, and prevents burnout
- **Progress Proxy**: Monitors streaks, awards XP, and provides motivation through gamification

### Personal Productivity Capabilities
- **Mobile Integration**: iOS Shortcuts, Android tiles, and wearable support
- **Gamification System**: XP, streaks, rewards, and achievement tracking
- **Adaptive Nudging**: Learning system that adapts to your preferences and patterns
- **Micro-Sprint Workflows**: 2-second captures that expand into productive sessions
- **Energy Optimization**: AI-powered timing suggestions based on your patterns
- **Progress Visualization**: Real-time dashboards showing productivity metrics

## Prerequisites

- Node.js 18+
- Python 3.8+
- OpenAI API Key (for the PydanticAI agents)
- Playwright (automatically installed with Stagehand)
- PostgreSQL (for learning patterns and progress tracking)
- Any of the following package managers:
  - pnpm (recommended)
  - npm
  - yarn
  - bun

> **Note:** This repository ignores lock files (package-lock.json, yarn.lock, pnpm-lock.yaml, bun.lockb) to avoid conflicts between different package managers. Each developer should generate their own lock file using their preferred package manager. After that, make sure to delete it from the .gitignore.

## Getting Started

1. Install dependencies using your preferred package manager:
```bash
# Using pnpm (recommended)
pnpm install

# Using npm
npm install

# Using yarn
yarn install

# Using bun
bun install
```

2. Install Python dependencies for the PydanticAI agent:
```bash
# Using pnpm
pnpm install:agent

# Using npm
npm run install:agent

# Using yarn
yarn install:agent

# Using bun
bun run install:agent
```

> **Note:** This will automatically setup a `.venv` (virtual environment) inside the `agent` directory.
>
> To activate the virtual environment manually, you can run:
> ```bash
> source agent/.venv/bin/activate
> ```

3. Set up your OpenAI API key:
```bash
export OPENAI_API_KEY="your-openai-api-key-here"
```

4. Start the development server:
```bash
# Using pnpm
pnpm dev

# Using npm
npm run dev

# Using yarn
yarn dev

# Using bun
bun run dev
```

This will start both the UI and agent servers concurrently.

## 🏗️ Architecture

### Frontend (Next.js + TypeScript)
- **Personal Dashboard**: Real-time productivity metrics and gamification
- **CopilotKit Integration**: Natural language interaction with proxy agents
- **Mobile Integration**: iOS Shortcuts and Android tile support
- **Gamification UI**: XP tracking, streaks, and achievement displays
- **Real-time Updates**: WebSocket-based live updates for agent status and progress

### Backend (Python + PydanticAI)
- **Proxy Agent Registry**: Central management of all proxy agent types
- **Task Queue**: Priority-based task scheduling optimized for personal productivity
- **Learning System**: Pattern recognition and adaptive optimization
- **Gamification Engine**: XP calculation, streak tracking, and reward distribution
- **Mobile API**: Endpoints for iOS Shortcuts, Android tiles, and wearable integration

### Proxy Agent Types Architecture
```
agent/
├── proxy_agents/
│   ├── task_proxy.py           # Micro-task capture and delegation
│   ├── focus_proxy.py          # Attention management and distraction blocking
│   ├── energy_proxy.py         # Energy optimization and timing suggestions
│   └── progress_proxy.py       # Gamification, streaks, and motivation
├── agent_registry.py           # Central proxy agent management
├── task_queue.py               # Personal productivity task scheduling
├── gamification_engine.py      # XP, streaks, and rewards system
└── mobile_integration.py       # iOS Shortcuts and Android tile support
```

## Available Scripts
The following scripts can also be run using your preferred package manager:
- `dev` - Starts both UI and agent servers in development mode
- `dev:debug` - Starts development servers with debug logging enabled
- `dev:ui` - Starts only the Next.js UI server
- `dev:agent` - Starts only the PydanticAI agent server
- `dev:proxy-platform` - Starts the full proxy platform with all agent types
- `build` - Builds the Next.js application for production
- `start` - Starts the production server
- `lint` - Runs ESLint for code linting
- `install:agent` - Installs Python dependencies for the agent

## 📋 Proxy Agent Examples

### Task Proxy
```typescript
// Capture a micro-task instantly
await captureTask({
  type: 'task_proxy',
  task: {
    description: 'Call dentist to schedule cleaning',
    priority: 'medium',
    energy_required: 'low',
    estimated_duration: '5m'
  },
  capture_method: 'ios_shortcut' // or 'android_tile', 'voice', 'chat'
});
```

### Focus Proxy
```typescript
// Start a focused work session
await startFocusSession({
  type: 'focus_proxy',
  session: {
    duration: '25m',
    task: 'Write quarterly report',
    environment: 'quiet_office',
    distractions_blocked: ['social_media', 'email']
  },
  energy_level: 'high'
});
```

### Energy Proxy
```typescript
// Get energy optimization suggestions
await getEnergyOptimization({
  type: 'energy_proxy',
  context: {
    current_energy: 'medium',
    time_of_day: '2pm',
    recent_activities: ['meeting', 'lunch'],
    upcoming_tasks: ['creative_work', 'admin_tasks']
  }
});
```

### Progress Proxy
```typescript
// Track progress and award XP
await trackProgress({
  type: 'progress_proxy',
  activity: {
    task_completed: 'Call dentist',
    xp_earned: 50,
    streak_maintained: true,
    achievement_unlocked: 'phone_calls_master'
  }
});
```

## Mobile Integration

### iOS Shortcuts
- **Quick Capture**: "Hey Siri, add task" → Instant task capture
- **Focus Mode**: "Hey Siri, start focus" → Begin focused work session
- **Energy Check**: "Hey Siri, how's my energy?" → Get optimization suggestions
- **Progress Update**: "Hey Siri, update progress" → Track achievements

### Android Tiles
- **Task Capture Tile**: One-tap task addition
- **Focus Session Tile**: Quick focus session start
- **Energy Monitor Tile**: Real-time energy level display
- **Progress Tile**: XP and streak tracking

### Wearable Support
- **Apple Watch**: Quick task capture and progress tracking
- **Galaxy Watch**: Voice commands and haptic feedback
- **Smart Notifications**: Contextual nudges and reminders

## Documentation

For detailed technical documentation, see:
- [Technical Specification](./docs/TECHNICAL_SPECIFICATION.md) - System architecture and API specs
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) - Production deployment instructions
- [Mobile Integration Guide](./docs/Mobile_Integration_Guide.md) - iOS Shortcuts and Android setup

### Core Components
- **Personal Dashboard**: `src/app/page.tsx` - Main productivity interface
- **Proxy Agent Registry**: `agent/agent_registry.py` - Central proxy agent management
- **Gamification Engine**: `agent/gamification_engine.py` - XP and rewards system
- **Mobile API**: `src/app/api/mobile/` - iOS Shortcuts and Android endpoints

### Configuration
- **Proxy Agent Settings**: `agent/settings.py` - Agent configuration and limits
- **Gamification Rules**: `agent/gamification_rules.py` - XP calculation and reward logic
- **Mobile Integration**: `agent/mobile_integration.py` - iOS Shortcuts and Android setup
- **Database**: PostgreSQL setup for learning patterns and progress tracking
- **Environment**: `.env` file for API keys and database connections

## 📚 Additional Resources

- [PydanticAI Documentation](https://ai.pydantic.dev) - Learn more about PydanticAI and its features
- [CopilotKit Documentation](https://docs.copilotkit.ai) - Explore CopilotKit's capabilities
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [iOS Shortcuts Documentation](https://developer.apple.com/documentation/shortcuts) - iOS Shortcuts integration
- [Android Tiles Documentation](https://developer.android.com/guide/topics/ui/tiles) - Android tile development

## Contributing

Feel free to submit issues and enhancement requests! This platform is designed to be easily extensible for personal productivity needs.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### Proxy Agent Connection Issues
If you see "I'm having trouble connecting to my tools", make sure:
1. The PydanticAI agent is running on port 8000
2. Your OpenAI API key is set correctly
3. Both servers started successfully

### Python Dependencies
If you encounter Python import errors:
```bash
cd agent
pip install -r requirements.txt
```

### Mobile Integration Issues
- **iOS Shortcuts**: Ensure the app is properly configured in Shortcuts app
- **Android Tiles**: Check that the tile service is running and permissions are granted
- **Wearable Support**: Verify Bluetooth connectivity and app permissions

NOTE: there is partial implementation in https://github.com/blopit/RedHospitalityCommandCenter and you can download it as reference and /primer it