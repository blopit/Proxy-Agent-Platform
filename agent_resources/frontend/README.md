# Frontend Agent - Quick Start

**Your Mission**: Build React Native mobile app (iOS/Android/Web), design UI/UX, implement features

**Last Updated**: November 13, 2025

---

## 🎯 Essential Reading (10 minutes)

1. **[Task Card Breakdown](../docs/guides/TASK_CARD_BREAKDOWN.md)** (4 min) - Task UI implementation
2. **[Frontend Developer Start](../docs/getting-started/FRONTEND_DEVELOPER_START.md)** (3 min) - Quick setup
3. **[Theme Integration](../../mobile/docs/MULTI_THEME_GUIDE.md)** (3 min) - Theme system

## 📚 Core Documentation

### Component Development
- **[Task Card Breakdown](../docs/guides/TASK_CARD_BREAKDOWN.md)** - Task card UI patterns
- **[Focus Mode Guide](../docs/guides/FOCUS_MODE_GUIDE.md)** - Focus mode implementation
- **[Multi-Theme Guide](../../mobile/docs/MULTI_THEME_GUIDE.md)** - Theme system
- **[Theme Integration Example](../../mobile/docs/THEME_INTEGRATION_EXAMPLE.md)** - Theme usage

### Authentication & OAuth
- **[Frontend Authentication](../docs/authentication/04_frontend_authentication.md)** - Auth implementation
- **[OAuth Integration](../docs/authentication/05_oauth_integration.md)** - OAuth providers
- **[Onboarding Flow](../docs/authentication/06_onboarding_flow.md)** - User onboarding

### Onboarding System
- **[Frontend Implementation](../docs/onboarding/01_FRONTEND.md)** - Onboarding UI
- **[Quick Start](../docs/onboarding/04_QUICK_START.md)** - Onboarding setup
- **[OpenMoji Standards](../docs/onboarding/OPENMOJI_STANDARDS.md)** - Emoji usage
- **[Routing Fix Summary](../docs/onboarding/ROUTING_FIX_SUMMARY.md)** - Navigation fixes

### Design System
- **[CHAMPS Framework](../architecture/design/CHAMPS_FRAMEWORK.md)** - ADHD-optimized design
- **[Progress Bar System](../architecture/design/PROGRESS_BAR_SYSTEM_DESIGN.md)** - Progress UX
- **[Mapper Subtabs Brainstorm](../architecture/design/MAPPER_SUBTABS_BRAINSTORM.md)** - Mapper UI

---

## 🎯 Your Responsibilities

1. **Develop Components**: React Native components, screens, navigation
2. **Implement UI/UX**: Design system, animations, interactions
3. **Integrate APIs**: Connect to backend, handle auth, manage state
4. **Write Stories**: Storybook stories for component documentation
5. **Test Components**: Component tests, interaction tests
6. **Maintain Docs**: Keep component docs and stories current

---

## 📊 Tech Stack

**Framework**: React Native with Expo (iOS, Android, Web from one codebase)

**Language**: TypeScript

**UI Components**: Custom design system with theme support

**State Management**: React Context + hooks

**Navigation**: Expo Router (file-based routing)

**Development**: Storybook for component development

**Testing**: Jest + React Native Testing Library (when implemented)

---

## 🚀 Quick Start

### Setup

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
# iOS: Press 'i' in terminal
# Android: Press 'a' in terminal
# Web: Press 'w' in terminal
```

### Development Workflow

1. **Check current work**: `cat ../agent_resources/status/frontend/`
2. **Create component**: Follow existing patterns
3. **Build Storybook story**: Document component variants
4. **Integrate with backend**: Use API client
5. **Test manually**: Run on device/simulator
6. **Update docs**: Keep component docs current

### Common Tasks

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web

# Start Storybook (component development)
npm run storybook

# Lint code (if configured)
npm run lint

# Type check (if configured)
npm run type-check
```

---

## 📁 Project Structure

```
mobile/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation setup
│   ├── api/            # API client and hooks
│   ├── context/        # React Context providers
│   ├── theme/          # Theme configuration
│   └── utils/          # Utility functions
├── components/         # Additional components
│   └── ui/            # UI components (ThemeSwitcher, etc.)
├── docs/              # Documentation
└── .storybook/        # Storybook configuration
```

---

## 🎨 Theme System

### Using Themes

```typescript
import { useTheme } from '@/theme/ThemeContext';

export default function MyComponent() {
  const { theme, colors } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
}
```

### Available Themes

- **Light**: Default light theme
- **Dark**: Dark theme
- **Ocean**: Blue/cyan theme
- **Sunset**: Orange/red theme
- **Forest**: Green theme
- **Purple Rain**: Purple theme

See [Multi-Theme Guide](../../mobile/docs/MULTI_THEME_GUIDE.md) for complete documentation.

---

## 🧩 Component Development

### Storybook Stories

Create stories for all components:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ThemeSwitcher } from './ThemeSwitcher';

const meta: Meta<typeof ThemeSwitcher> = {
  title: 'UI/ThemeSwitcher',
  component: ThemeSwitcher,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

### Component Patterns

- Use TypeScript for all components
- Follow existing naming conventions
- Include PropTypes/TypeScript types
- Document props and usage
- Create Storybook stories
- Keep components small and focused

---

## 🔐 Authentication Flow

### OAuth Integration

```typescript
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// Initialize OAuth flow
const [request, response, promptAsync] = AuthSession.useAuthRequest({
  clientId: 'YOUR_CLIENT_ID',
  redirectUri: AuthSession.makeRedirectUri(),
  scopes: ['openid', 'profile', 'email'],
});

// Handle response
useEffect(() => {
  if (response?.type === 'success') {
    // Exchange code for token
  }
}, [response]);
```

See [Frontend Authentication](../docs/authentication/04_frontend_authentication.md) for complete guide.

---

## 🧪 Testing (Planned)

### Component Testing

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByText } = render(<MyComponent onPress={onPress} />);
    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

See [Frontend Testing Guide](../testing/03_FRONTEND_TESTING.md) for comprehensive testing documentation.

---

## 🛠️ Current Status

Check implementation status:

- **[ChevronTaskFlow](../status/frontend/)** - 90% complete
- **[Task Template Library](../status/frontend/)** - Not started
- **[Focus Timer Component](../status/frontend/)** - Not started

See [../status/README.md](../status/README.md) for all frontend status docs.

---

## 🗺️ Roadmap

Check current priorities:

- **[Current Sprint](../planning/current_sprint.md)** - This week's work
- **[Next 5 Tasks](../planning/next_5_tasks.md)** - Upcoming priorities

---

## 📚 Related Documentation

### Design & UX
- **[CHAMPS Framework](../architecture/design/CHAMPS_FRAMEWORK.md)** - ADHD-optimized design principles
- **[Task Card Breakdown](../docs/guides/TASK_CARD_BREAKDOWN.md)** - Task UI patterns
- **[Progress Bar System](../architecture/design/PROGRESS_BAR_SYSTEM_DESIGN.md)** - Progress visualization

### API Integration
- **[API Reference](../backend/api/API_REFERENCE.md)** - Backend endpoints
- **[Integration Guide](../backend/INTEGRATION_GUIDE.md)** - Integration patterns

### Authentication
- **[Frontend Authentication](../docs/authentication/04_frontend_authentication.md)** - Auth implementation
- **[OAuth Integration](../docs/authentication/05_oauth_integration.md)** - OAuth providers

### Getting Started
- **[Installation Guide](../docs/getting-started/installation.md)** - Complete setup
- **[Frontend Developer Start](../docs/getting-started/FRONTEND_DEVELOPER_START.md)** - Frontend onboarding

---

## 🆘 Need Help?

### Common Issues

- **Metro bundler errors**: Clear cache with `npm start -- --reset-cache`
- **Module not found**: Run `npm install` to sync dependencies
- **iOS build errors**: Run `cd ios && pod install && cd ..`
- **Android build errors**: Check Android SDK and emulator setup
- **Theme not working**: Check ThemeContext provider wrapper

### Documentation

- **Expo Docs**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/docs/getting-started
- **Storybook**: https://storybook.js.org/docs/react/get-started/introduction

### Development Tools

- **Expo Go**: Test on physical device without building
- **Storybook**: Component development and documentation
- **React DevTools**: Debug React components
- **Expo DevTools**: Debug Expo-specific features

---

**Navigation**: [↑ Agent Resources](../README.md) | [📚 Docs Index](../docs/README.md) | [🎯 Tasks](../tasks/README.md)
