# Task Management Frontend

A Next.js-based mobile-optimized frontend for the Proxy Agent Platform task management system.

## Features

- **Quick Capture**: Fast task creation with voice input and location awareness
- **Task Management**: Full CRUD operations with filtering and sorting
- **Mobile Optimized**: Responsive design with touch-friendly interactions
- **Real-time Updates**: Live task synchronization
- **Voice Input**: Web Speech API integration for hands-free task creation

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) to view the dashboard

4. Navigate to [http://localhost:3000/tasks](http://localhost:3000/tasks) for task management

## Available Pages

- `/` - Main productivity dashboard
- `/tasks` - Task management interface with QuickCapture and TaskList

## Components

### Task Components

- **TaskDashboard** - Main task management interface
- **QuickCapture** - Fast task creation with voice and location
- **TaskList** - Responsive task listing with filtering and actions

### API Integration

- **taskApi** - Centralized API service for backend communication
- **Types** - TypeScript definitions matching backend models

## Development

```bash
# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

## Backend Integration

The frontend connects to the FastAPI backend at `http://localhost:8000` by default.

Set `NEXT_PUBLIC_API_URL` environment variable to change the backend URL.

## Voice Features

Voice input requires:
- Modern browser with Web Speech API support
- Microphone permissions
- HTTPS in production (development works on localhost)

## Performance

- 2-second target for quick capture operations
- Optimistic UI updates for instant feedback
- Virtual scrolling for large task lists
- Progressive enhancement for unsupported features