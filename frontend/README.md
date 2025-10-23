# Proxy Agent Platform - Frontend

A Next.js 14-based mobile-first frontend for the Proxy Agent Platform, featuring biological workflow modes (Capture → Scout → Hunt → Map → Mend), Netflix-style UI, and AI-powered task management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Backend API running at `http://localhost:8000`
- Modern browser (Chrome, Firefox, Edge, Safari)

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Development Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run type-check   # TypeScript checking
npm run lint         # ESLint checking
npm test             # Run tests (future)
```

---

## 📚 **ESSENTIAL DOCUMENTATION**

**Before coding, read these documents:**

1. **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - 🎯 **START HERE** - Main navigation for all developers
2. **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Design tokens (spacing, colors, animations) - **USE ALWAYS**
3. **[COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md)** - Index of 50+ existing components - **CHECK BEFORE CREATING**
4. **[DONT_RECREATE.md](./DONT_RECREATE.md)** - Existing systems checklist - **PREVENT DUPLICATION**
5. **[API_PATTERNS.md](./API_PATTERNS.md)** - API integration guide - **FOLLOW PATTERNS**

**Golden Rule**: Search documentation first, code second. If it feels like something that should exist, it probably does!

---

## 🏗️ Architecture Overview

The frontend follows a **4-layer architecture** for clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Pages (App Router)                            │
│  src/app/                                                │
│  • Route definitions                                     │
│  • Server components                                     │
│  • Layout composition                                    │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Components                                     │
│  src/components/                                         │
│  • Mobile components (50+ components)                    │
│  • Dashboard components                                  │
│  • Task components                                       │
│  • System components (design system)                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Hooks (React Hooks)                            │
│  src/hooks/                                              │
│  • useVoiceInput - Voice-to-text                         │
│  • useWebSocket - Real-time updates                      │
│  • useCaptureFlow - Task capture workflow                │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Library & Utilities                            │
│  src/lib/ + src/types/                                   │
│  • design-system.ts (CRITICAL!)                          │
│  • api.ts - API client                                   │
│  • ai-api.ts - AI endpoints                              │
│  • utils.ts - Utilities                                  │
│  • Type definitions                                      │
└─────────────────────────────────────────────────────────┘
```

**See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for complete architecture details**

---

## 🎨 Design System (CRITICAL!)

### **NEVER HARDCODE DESIGN VALUES**

All visual styling uses tokens from [`src/lib/design-system.ts`](src/lib/design-system.ts:1):

```typescript
import { spacing, semanticColors, fontSize, borderRadius } from '@/lib/design-system'

// ✅ GOOD: Using design tokens
<div style={{
  padding: spacing[4],                    // 16px
  backgroundColor: semanticColors.bg.primary,
  color: semanticColors.text.primary,
  borderRadius: borderRadius.lg           // 16px
}} />

// ❌ BAD: Hardcoded values (ESLint will catch these!)
<div style={{
  padding: '16px',
  backgroundColor: '#002b36',
  borderRadius: '16px'
}} />
```

### Available Design Tokens

- **Spacing** (4px grid): `spacing[1]` to `spacing[32]`
- **Colors**: Solarized Dark palette with semantic mappings
- **Typography**: `fontSize.xs` to `fontSize['4xl']`
- **Shadows**: `shadow.sm` to `shadow.xl` + `coloredShadow()` helper
- **Animations**: `duration.fast`, `animation.celebration`, `physics.gravity`
- **And more**: opacity, z-index, border-radius, icon sizes

**📚 Full Documentation**: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

---

## 📱 Key Features

### Biological Workflow Modes
Five modes based on ADHD-friendly biological workflows:

1. **Capture** - Quick task capture with voice input (2-second target)
2. **Scout** - Netflix-style task browsing with smooth scrolling
3. **Hunt** - Deep work mode with focus timer
4. **Map** - Task breakdown and dependency visualization
5. **Mend** - Review completed tasks and reflect on progress

### Mobile-First Design
- Touch-friendly interactions
- Bottom tab navigation
- Smooth momentum scrolling (no snap-scrolling)
- Variable card sizes (hero, standard, compact)
- Edge fade gradients for "peek next card" effect

### Gamification
- XP and achievement system
- Streak tracking
- Particle celebration animations
- Progress visualization
- Mystery task bonuses (15% chance)

### Real-Time Features
- WebSocket integration for live updates
- Optimistic UI updates
- Voice input with Web Speech API
- Task drop animations with physics

---

## 📁 Directory Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Dashboard
│   │   └── mobile/                   # Mobile routes
│   ├── components/                   # React components
│   │   ├── mobile/                   # Mobile components (50+)
│   │   │   ├── modes/                # Biological modes
│   │   │   ├── cards/                # Card components
│   │   │   └── [other mobile UI]
│   │   ├── dashboard/                # Dashboard components
│   │   ├── tasks/                    # Task management
│   │   ├── system/                   # Design system components
│   │   └── ui/                       # shadcn/ui primitives
│   ├── hooks/                        # Custom React hooks
│   ├── lib/                          # Utilities & API clients
│   │   └── design-system.ts          # Design tokens (CRITICAL!)
│   └── types/                        # TypeScript types
├── public/                           # Static assets
├── DEVELOPER_GUIDE.md                # Main dev navigation (START HERE)
├── DESIGN_SYSTEM.md                  # Design token catalog
├── COMPONENT_CATALOG.md              # Component inventory
├── DONT_RECREATE.md                  # Systems checklist
├── API_PATTERNS.md                   # API integration guide
└── README.md                         # This file
```

---

## 🌐 Backend Integration

### API Client
Use the centralized API client from [`src/lib/api.ts`](src/lib/api.ts:1):

```typescript
import { apiClient } from '@/lib/api'

// Get tasks
const tasks = await apiClient.getTasks({ user_id: 'demo-user' })

// Quick capture
const result = await apiClient.quickCapture({
  text: 'Deploy to production',
  user_id: 'demo-user',
  auto_mode: true
})

// Energy tracking
const energy = await apiClient.getEnergyLevel('demo-user')
```

**📚 Full API Documentation**: [API_PATTERNS.md](./API_PATTERNS.md)

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🧪 Development Workflow

### Before Creating Any Component

1. **Check [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md)** - Does it exist?
2. **Check [DONT_RECREATE.md](./DONT_RECREATE.md)** - Is there a system for this?
3. **Review [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - What tokens should I use?
4. **Check [API_PATTERNS.md](./API_PATTERNS.md)** - How do I integrate with the backend?

### Component Creation Checklist

- [ ] Search [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md) first
- [ ] Import design system tokens
- [ ] Define TypeScript interfaces for props
- [ ] Add JSDoc comments
- [ ] Use semantic colors (not hardcoded)
- [ ] Follow 4px grid with spacing tokens
- [ ] Test in browser
- [ ] Add to [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md)

**📚 Full Workflow**: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md#-how-to-add-a-new-feature-step-by-step)

---

## 🎯 Performance Targets

- **2-second task capture** - From voice input to saved
- **< 500ms API response** - Average response time
- **< 100ms UI updates** - Optimistic updates
- **< 2s dashboard load** - Complete dashboard with data
- **60fps animations** - Smooth particle physics

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Design System Tokens
- **Icons**: lucide-react
- **API Client**: Custom fetch wrapper with types
- **State**: React hooks (useState, useEffect, custom hooks)
- **Real-time**: WebSocket integration
- **Voice**: Web Speech API

---

## 📚 Additional Resources

### Core Documentation
- **[../README.md](../README.md)** - Platform overview
- **[../CLAUDE.md](../CLAUDE.md)** - Backend coding standards
- **[../docs/TECH_STACK.md](../docs/TECH_STACK.md)** - Full tech stack

### Frontend Documentation
- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - 🎯 **START HERE**
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Design tokens
- **[COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md)** - Component inventory
- **[DONT_RECREATE.md](./DONT_RECREATE.md)** - Systems checklist
- **[API_PATTERNS.md](./API_PATTERNS.md)** - API integration

---

## 🤝 Contributing

1. Read [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) thoroughly
2. Follow the 4-layer architecture
3. Use design system tokens exclusively
4. Check existing components before creating new ones
5. Write TypeScript types for everything
6. Test manually in browser
7. Run type-check and lint before committing

---

## 🆘 Getting Help

1. **Search the docs** - Check all 5 documentation files
2. **Check the code** - Look at similar components
3. **Check git history** - See how others solved problems
4. **Ask in team chat** - Explain what you've tried

---

**Built with ❤️ for ADHD-friendly productivity**

*Remember: Search documentation first, code second!*