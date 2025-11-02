# Profile Switcher Migration to Mapper Mode

## 🎯 Summary

Moved the profile switcher from the Capture mode's "Connect" tab to the Mapper mode, where it makes more sense contextually as a planning/overview feature.

---

## 📋 Changes Made

### 1. Created Reusable ProfileSwitcher Component

**File**: `mobile/src/components/mobile/ProfileSwitcher.tsx`

**Features**:
- ✅ Dropdown menu with 3 profiles (Personal, Lion Motel, AI Service)
- ✅ Profile-specific colors and emojis
- ✅ Compact mode support for flexible layouts
- ✅ Active profile indicator with colored dot
- ✅ Clean, reusable component API

**Props**:
```typescript
interface ProfileSwitcherProps {
  selectedProfile: Profile;
  onProfileChange: (profile: Profile) => void;
  compact?: boolean; // Optional compact view
}
```

**Profiles**:
- **Personal** (👤) - Blue `#268bd2`
- **Lion Motel** (🏨) - Orange `#cb4b16`
- **AI Service** (🤖) - Violet `#6c71c4`

---

### 2. Updated Mapper Mode

**File**: `mobile/app/(tabs)/mapper.tsx`

**Changes**:
- ✅ Added ProfileSwitcher component at top of screen
- ✅ Profile-aware content sections
- ✅ Overview stats card (Tasks, In Progress, Completed)
- ✅ Weekly progress placeholder
- ✅ Task zones with counts (Main Focus, Urgent, Quick Wins)
- ✅ Scrollable content with proper padding for tab bar

**Why Mapper Mode?**
- Mapper is the **planning and overview** mode
- Profile management is a **high-level organizational concept**
- Users naturally think about profiles when planning across contexts
- Keeps Capture mode focused on **speed and simplicity**

---

### 3. Simplified Capture/Connect Screen

**File**: `mobile/app/(tabs)/capture/connect.tsx`

**Changes**:
- ✅ Removed profile switcher UI
- ✅ Added read-only profile indicator at top
- ✅ Shows current active profile with hint: "💡 Switch profiles in Mapper mode"
- ✅ Simplified to focus on email connections only
- ✅ Uses `ConnectionElement` component for consistency

**Before**:
```
┌─────────────────────────────────┐
│ [Profile Dropdown]  ▼           │  ← User could switch here
├─────────────────────────────────┤
│ Email Connections               │
└─────────────────────────────────┘
```

**After**:
```
┌─────────────────────────────────┐
│ Current Profile: Personal 👤    │  ← Read-only indicator
│ 💡 Switch in Mapper mode        │
├─────────────────────────────────┤
│ Email Connections               │
└─────────────────────────────────┘
```

---

### 4. Updated TypeScript Configuration

**File**: `mobile/tsconfig.json`

**Changes**:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Benefit**: Allows imports like `@/src/components/mobile/ProfileSwitcher` instead of relative paths.

---

## 🏗️ Architecture Benefits

### Separation of Concerns

**Capture Mode**:
- **Purpose**: Quick task capture with minimal friction
- **Focus**: Speed, simplicity, email integration
- **Profile Role**: Read-only context indicator

**Mapper Mode**:
- **Purpose**: Planning, overview, organization
- **Focus**: Big picture thinking, context management
- **Profile Role**: Active switcher for managing different contexts

### User Experience Flow

```
┌─────────────────────────────────────────────────────┐
│                    USER JOURNEY                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Go to Mapper Mode                              │
│     ↓                                               │
│  2. Select Profile (Personal/Lion Motel/AI)        │
│     ↓                                               │
│  3. View profile-specific overview                 │
│     ↓                                               │
│  4. Switch to Capture/Scout/Today/Hunter           │
│     ↓                                               │
│  5. Work within selected profile context           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📱 Profile Context Flow

### Future: Global State Management

```typescript
// TODO: Implement with React Context or Zustand

// contexts/ProfileContext.tsx
export const ProfileProvider = ({ children }) => {
  const [activeProfile, setActiveProfile] = useState<Profile>('personal');

  return (
    <ProfileContext.Provider value={{ activeProfile, setActiveProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

// Usage in Mapper Mode
const { activeProfile, setActiveProfile } = useProfile();

// Usage in other modes (read-only)
const { activeProfile } = useProfile();
```

---

## 🎨 Visual Design

### ProfileSwitcher Component States

**Collapsed**:
```
┌──────────────────────────────────┐
│ 👤 Personal              ▼      │
└──────────────────────────────────┘
```

**Expanded**:
```
┌──────────────────────────────────┐
│ 👤 Personal              ▼      │ ← Active
├──────────────────────────────────┤
│ 👤 Personal                   ●  │ ← Selected (blue dot)
│ 🏨 Lion Motel                    │
│ 🤖 AI Service                    │
└──────────────────────────────────┘
```

### Compact Mode (Optional)

```
┌─────────────────┐
│ 👤 Personal  ▼ │  ← Smaller padding, text
└─────────────────┘
```

---

## 🚀 Next Steps

### Immediate

1. **Test the profile switcher** in Mapper mode
2. **Verify imports work** with `@/src` path alias
3. **Test navigation** between Mapper ↔ Capture/Connect

### Phase 2: Global State

1. Create `ProfileContext` provider
2. Wrap app in `ProfileProvider` at root layout
3. Update all modes to consume `useProfile()` hook
4. Update Capture/Connect to show actual active profile
5. Persist selected profile to AsyncStorage

### Phase 3: Profile-Specific Data

1. Filter tasks by profile in Scout/Today/Hunter modes
2. Load profile-specific email connections
3. Show profile-specific stats in Mapper mode
4. Sync profile across app restarts

---

## 📊 Files Modified

### Created (1 file)
- `mobile/src/components/mobile/ProfileSwitcher.tsx`

### Modified (3 files)
- `mobile/app/(tabs)/mapper.tsx`
- `mobile/app/(tabs)/capture/connect.tsx`
- `mobile/tsconfig.json`

---

## ✅ Testing Checklist

- [ ] ProfileSwitcher renders in Mapper mode
- [ ] Can switch between all 3 profiles
- [ ] Profile indicator shows in Capture/Connect
- [ ] Hint text directs users to Mapper mode
- [ ] No TypeScript errors with `@/src` imports
- [ ] UI looks good on iOS and Android
- [ ] Active profile has correct colored dot
- [ ] Menu dismisses after selection

---

## 🎯 Design Rationale

### Why Move to Mapper?

1. **Contextual Fit**: Mapper = planning/overview → Profile = context management
2. **Reduce Capture Friction**: Keep Capture laser-focused on speed
3. **User Mental Model**: "Set my context in Mapper, work in other modes"
4. **Discoverability**: Users naturally go to Mapper for big-picture tasks

### Why Reusable Component?

1. **Future Flexibility**: Can add profile switcher elsewhere if needed
2. **Consistency**: Same UI/UX wherever profiles appear
3. **Maintainability**: Single source of truth
4. **Compact Mode**: Option for smaller spaces (e.g., headers)

---

**Migration Status**: ✅ Complete
**Date**: 2025-11-01
**Next**: Implement global ProfileContext provider
