# Frontend Documentation Index

## 📚 Next.js Web Dashboard Documentation

Welcome to the documentation for the **Next.js Web Dashboard** - the desktop power user interface for the Proxy Agent Platform.

> **⚠️ Note**: This is the **SECONDARY** frontend. The **PRIMARY** frontend is the Expo mobile app located in `/mobile/`.
> This web dashboard is optimized for desktop users who need advanced features, analytics, and admin controls.

### Frontend Architecture
- **Primary Frontend**: `/mobile/` - Expo/React Native universal app (iOS, Android, Web)
- **Secondary Frontend**: `/frontend/` - Next.js web dashboard (you are here)

---

## 🗺️ Quick Navigation

### For New Developers/Agents

1. **Start Here**: [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md)
   - Overview of the 5 biological modes
   - Project structure
   - Tech stack and patterns

2. **Then**: [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md)
   - Complete component reference
   - Usage examples for all components
   - Props interfaces and examples

3. **Next**: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
   - Colors, spacing, typography
   - ADHD-optimized design patterns
   - Accessibility guidelines

4. **Finally**: [API_INTEGRATION.md](./API_INTEGRATION.md)
   - All API endpoints
   - Request/response formats
   - Integration patterns

### For Troubleshooting

5. **Need Help?**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
   - Common issues and solutions
   - Debugging tips
   - Performance optimization

---

## 📖 Documentation Files

### [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md)

**Purpose**: High-level architecture overview

**Contents**:
- 🏗️ Project structure and file organization
- 🧠 The 5 biological modes explained
- 🎨 Design system overview
- 🔌 API integration patterns
- 📱 Component composition examples
- 🚀 Common development tasks

**When to use**: Starting a new feature, understanding the system

---

### [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md)

**Purpose**: Complete component reference guide

**Contents**:
- 📦 All mobile components documented
- 🎯 Props interfaces with TypeScript
- 💡 Usage examples for each component
- 🔧 Component composition patterns
- ✅ Best practices

**Components covered**:
- Core Navigation (BiologicalTabs)
- Task Display (SwipeableTaskCard, CardStack, CategoryRow)
- Progress & Feedback (AsyncJobTimeline, EnergyGauge, TaskBreakdownModal)
- Utility Components (Layer, Ticker, etc.)
- Mode Components (Capture, Scout, Hunter, Mender, Mapper)

**When to use**: Building new components, using existing components

---

### [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

**Purpose**: Design tokens and ADHD-optimized patterns

**Contents**:
- 🎨 Complete color system (Solarized + semantic)
- 📏 Spacing system (4px grid)
- 📝 Typography scales
- 🔲 Border radius, shadows, z-index
- ⏱️ Animation durations and easings
- ♿ Accessibility guidelines
- 🎯 ADHD-specific UX principles

**When to use**: Styling components, ensuring consistency

---

### [API_INTEGRATION.md](./API_INTEGRATION.md)

**Purpose**: Complete API integration reference

**Contents**:
- 🔌 API client architecture
- 📋 All endpoints documented
- 🔄 Real-time updates (WebSocket)
- 🛠️ Common API patterns
- 🔍 Debugging API calls
- 🧪 Testing API integration
- 🚨 Error handling
- 📊 Performance optimization

**Endpoints covered**:
- Quick Capture (POST /api/v1/mobile/quick-capture)
- Get Tasks (GET /api/v1/tasks)
- Energy Tracking (GET /api/v1/energy/current-level)
- Progress Stats (GET /api/v1/gamification/progress/:user_id)

**When to use**: Integrating with backend, debugging API calls

---

### [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Purpose**: Common issues and solutions

**Contents**:
- 🔧 Common issues with solutions
- 🎯 Common development patterns
- 🔍 Debugging tips and tools
- 🚨 Error boundaries
- 📋 Feature development checklist

**Issues covered**:
- Tasks not loading
- Voice input not working
- Animations stuttering
- Design system colors not applying
- API calls failing
- Task breakdown not showing
- Energy gauge showing wrong value

**When to use**: Debugging issues, learning best practices

---

## 🎯 Documentation by Task

### "I want to add a new component"

1. Read: [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) → Component Best Practices
2. Reference: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) → Styling patterns
3. Check: [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) → File organization

**Example**:
```typescript
// 1. Create component file
// src/components/mobile/NewComponent.tsx

import { spacing, semanticColors, fontSize } from '@/lib/design-system'

interface NewComponentProps {
  title: string;
  onAction: () => void;
}

export default function NewComponent({ title, onAction }: NewComponentProps) {
  return (
    <div style={{
      padding: spacing[4],
      backgroundColor: semanticColors.bg.primary,
      borderRadius: borderRadius.xl
    }}>
      <h2 style={{ fontSize: fontSize.lg }}>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  )
}

// 2. Use in mode component
import NewComponent from '@/components/mobile/NewComponent'

<NewComponent title="Hello" onAction={() => console.log('clicked')} />
```

---

### "I want to integrate a new API endpoint"

1. Read: [API_INTEGRATION.md](./API_INTEGRATION.md) → API Client Patterns
2. Reference: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) → Error handling
3. Check: [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) → State management

**Example**:
```typescript
// 1. Add to API client (src/lib/api.ts)
export const apiClient = {
  async newEndpoint(data: NewRequest): Promise<NewResponse> {
    const response = await fetch(`${API_URL}/api/v1/new-endpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }
}

// 2. Use in component
const [data, setData] = useState<NewResponse | null>(null)
const [isLoading, setIsLoading] = useState(false)

const fetchData = async () => {
  setIsLoading(true)
  try {
    const result = await apiClient.newEndpoint({ param: 'value' })
    setData(result)
  } catch (error) {
    console.error('Failed:', error)
  } finally {
    setIsLoading(false)
  }
}
```

---

### "I want to add a new biological mode"

1. Read: [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) → The 5 Biological Modes
2. Reference: [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) → Mode Components
3. Check: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) → Mode colors

**Steps**:
```typescript
// 1. Create mode component
// src/components/mobile/modes/NewMode.tsx
export default function NewMode({ onTaskTap, refreshTrigger }) {
  // Mode implementation
}

// 2. Add to BiologicalTabs
// src/components/mobile/BiologicalTabs.tsx
const circuits = [
  // ... existing modes
  {
    id: 'newmode',
    name: 'New',
    icon: YourIcon,
    description: 'Description',
    purpose: 'Mode purpose',
    color: colors.yourColor,
    isOptimal: yourLogic
  }
]

// 3. Add to main app
// src/app/mobile/page.tsx
type Mode = 'capture' | 'search' | 'hunt' | 'rest' | 'plan' | 'newmode'

{mode === 'newmode' && (
  <NewMode
    onTaskTap={handleTaskTap}
    refreshTrigger={refreshTrigger}
  />
)}
```

---

### "I want to style a component"

1. Read: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) → All design tokens
2. Check: [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) → Styling patterns
3. Reference: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) → Common issues

**Best Practices**:
```typescript
import {
  spacing,
  semanticColors,
  fontSize,
  borderRadius,
  shadow
} from '@/lib/design-system'

// ✅ Good - Use design system
<div style={{
  padding: spacing[4],              // Not '16px'
  backgroundColor: semanticColors.bg.primary,  // Not '#002b36'
  fontSize: fontSize.base,          // Not '1rem'
  borderRadius: borderRadius.xl,    // Not '12px'
  boxShadow: shadow.md             // Not custom shadow
}}>

// ✅ Good - ADHD-friendly spacing
<div style={{
  padding: spacing[4],      // Generous padding
  marginBottom: spacing[8]  // Clear section separation
}}>

// ✅ Good - Semantic colors for dark mode
<div style={{
  color: semanticColors.text.primary,        // Auto adapts
  backgroundColor: semanticColors.bg.secondary
}}>
```

---

## 🔍 Finding Information Quickly

### Component Usage

```
Question: "How do I use SwipeableTaskCard?"
Answer: COMPONENT_LIBRARY.md → Task Display Components → SwipeableTaskCard
```

### API Endpoint

```
Question: "How do I fetch tasks?"
Answer: API_INTEGRATION.md → Core API Endpoints → Get Tasks
```

### Design Token

```
Question: "What spacing should I use?"
Answer: DESIGN_SYSTEM.md → Spacing System
```

### Common Issue

```
Question: "Tasks not loading?"
Answer: TROUBLESHOOTING.md → Issue: Tasks Not Loading
```

---

## 📂 File Organization Reference

```
frontend/
├── docs/                          # ← YOU ARE HERE
│   ├── README.md                 # This index
│   ├── FRONTEND_ARCHITECTURE.md  # High-level overview
│   ├── COMPONENT_LIBRARY.md      # Component reference
│   ├── DESIGN_SYSTEM.md          # Design tokens
│   ├── API_INTEGRATION.md        # API guide
│   └── TROUBLESHOOTING.md        # Issues & solutions
│
├── src/
│   ├── app/mobile/               # Mobile app pages
│   │   ├── page.tsx             # Main app shell
│   │   └── README.md            # ADHD system docs
│   │
│   ├── components/mobile/        # Mobile components
│   │   ├── modes/               # 5 biological modes
│   │   ├── BiologicalTabs.tsx
│   │   ├── SwipeableTaskCard.tsx
│   │   └── ...
│   │
│   ├── lib/                     # Core utilities
│   │   ├── design-system.ts    # Design tokens
│   │   ├── api.ts              # API client
│   │   └── ...
│   │
│   ├── hooks/                   # Custom hooks
│   │   ├── useVoiceInput.ts
│   │   └── useWebSocket.ts
│   │
│   └── types/                   # TypeScript types
│
└── package.json
```

---

## 🎓 Learning Path for New Agents

### Day 1: Understand the System
- [ ] Read [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) completely
- [ ] Understand the 5 biological modes concept
- [ ] Review project structure
- [ ] Run `npm install && npm run dev`

### Day 2: Components & Design
- [ ] Read [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md)
- [ ] Study 3-5 key components in detail
- [ ] Read [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- [ ] Practice using design tokens

### Day 3: API Integration
- [ ] Read [API_INTEGRATION.md](./API_INTEGRATION.md)
- [ ] Test API endpoints with Postman/curl
- [ ] Understand request/response formats
- [ ] Practice error handling

### Day 4: Hands-on Development
- [ ] Build a simple component using design system
- [ ] Integrate with an API endpoint
- [ ] Add to one of the modes
- [ ] Test in browser

### Day 5: Troubleshooting & Optimization
- [ ] Read [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [ ] Debug a common issue
- [ ] Optimize component performance
- [ ] Review best practices

---

## 🤝 Contributing to Docs

### When to Update Documentation

- **Adding a new component**: Update [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md)
- **Adding design tokens**: Update [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- **Adding API endpoint**: Update [API_INTEGRATION.md](./API_INTEGRATION.md)
- **Found a solution**: Update [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Architectural change**: Update [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md)

### Documentation Style

```markdown
## Section Title

**Purpose**: One-line description

**Contents**:
- Bullet points
- Clear structure
- Examples included

**Usage**:
\`\`\`typescript
// Code examples with comments
\`\`\`

**When to use**: Clear guidance
```

---

## 🔗 Related Documentation

### In This Repository

- **Backend API**: `/API_schemas/`
- **ADHD System Design**: `docs/ADHD_TASK_MANAGEMENT_MASTER.md`
- **Mobile README**: `frontend/src/app/mobile/README.md`
- **Repository Structure**: `docs/REPOSITORY_STRUCTURE.md`

### External Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 📞 Getting Help

### For Developers

1. Check this documentation index
2. Search the specific doc file
3. Check TROUBLESHOOTING.md
4. Review code examples in components
5. Create an issue if stuck

### For AI Agents

1. **Start with context**: Read FRONTEND_ARCHITECTURE.md
2. **Find specific info**: Use this index to locate exact doc
3. **See examples**: COMPONENT_LIBRARY.md has complete examples
4. **Debug issues**: TROUBLESHOOTING.md has solutions
5. **Verify patterns**: Check existing code for similar patterns

---

## ⭐ Key Principles

### ADHD-Optimized Development

- **Generous spacing** reduces visual clutter
- **Clear visual hierarchy** guides attention
- **Immediate feedback** for all interactions
- **Dopamine optimization** through gamification
- **One task at a time** reduces overwhelm

### Code Quality

- **TypeScript strict mode** for type safety
- **Design system tokens** for consistency
- **Component composition** over complexity
- **Performance optimization** with React.memo/useMemo
- **Accessible by default** with semantic HTML and ARIA

### Best Practices

- **Keep components under 300 lines**
- **Use functional components with hooks**
- **Follow design system religiously**
- **Handle loading and error states**
- **Test in browser before committing**

---

**Last Updated**: 2025-10-25

**Maintained by**: Frontend Team

**Version**: 1.0.0

---

## 📑 Quick Links

| Need | Document | Section |
|------|----------|---------|
| Architecture overview | [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) | Overview |
| Component usage | [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) | Component reference |
| Styling guide | [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Design tokens |
| API endpoints | [API_INTEGRATION.md](./API_INTEGRATION.md) | Core APIs |
| Debugging | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues |

---

**Welcome to the team! Start with [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) →**
