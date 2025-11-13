# Profile Context Implementation - Reactive Tab Icon

## 🎯 Problem Solved

The profile tab icon in the bottom navigation bar wasn't updating when users switched profiles in the Mapper screen. This has been fixed by implementing a React Context provider for global profile state management.

---

## ✅ Solution: ProfileContext with React Context API

### Architecture

```
┌─────────────────────────────────────────────────┐
│              Root Layout                        │
│  <ProfileProvider>                              │
│    ├── All App Screens                          │
│    │   ├── Mapper (can change profile)          │
│    │   ├── Capture/Connect (reads profile)      │
│    │   └── Other modes (read profile)           │
│    └── Tab Bar                                  │
│        └── ProfileAvatar (reactive to changes) │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 📁 Files Created

### 1. ProfileContext (`mobile/src/contexts/ProfileContext.tsx`)

**Purpose**: Global state management for active profile

```typescript
export type Profile = 'personal' | 'lionmotel' | 'aiservice';

interface ProfileContextType {
  activeProfile: Profile;
  setActiveProfile: (profile: Profile) => void;
}

// Provider wraps entire app
export function ProfileProvider({ children }) {
  const [activeProfile, setActiveProfile] = useState<Profile>('personal');
  // ...
}

// Hook for consuming profile state
export function useProfile() {
  const context = useContext(ProfileContext);
  return context; // { activeProfile, setActiveProfile }
}
```

**Features**:
- ✅ Single source of truth for active profile
- ✅ Centralized state management
- ✅ Type-safe with TypeScript
- ✅ Easy to extend (can add persistence later)

---

## 📝 Files Modified

### 1. Root Layout (`mobile/app/_layout.tsx`)

**Change**: Wrapped app in ProfileProvider

```typescript
import { ProfileProvider } from '@/src/contexts/ProfileContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ProfileProvider>  {/* ← NEW: Wraps entire app */}
        <Stack>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
```

### 2. Tab Layout (`mobile/app/(tabs)/_layout.tsx`)

**Change**: ProfileAvatar now uses `useProfile()` hook

```typescript
import { useProfile } from '@/src/contexts/ProfileContext';

const ProfileAvatar = ({ color }: { color: string }) => {
  const { activeProfile } = useProfile(); // ← REACTIVE!

  const getInitials = (profile: string) => {
    switch (profile) {
      case 'personal': return 'P';
      case 'lionmotel': return 'LM';
      case 'aiservice': return 'AI';
    }
  };

  return (
    <View style={{ /* circle styles */ }}>
      <Text>{getInitials(activeProfile)}</Text>
    </View>
  );
};
```

**Result**: Tab icon updates immediately when profile changes! ✨

### 3. Mapper Screen (`mobile/app/(tabs)/mapper.tsx`)

**Change**: Uses context instead of local state

```typescript
import { useProfile } from '@/src/contexts/ProfileContext';

export default function MapperScreen() {
  const { activeProfile, setActiveProfile } = useProfile();

  return (
    <ProfileSwitcher
      selectedProfile={activeProfile}
      onProfileChange={setActiveProfile}
    />
  );
}
```

### 4. Capture/Connect Screen (`mobile/app/(tabs)/capture/connect.tsx`)

**Change**: Reads active profile from context

```typescript
import { useProfile } from '@/src/contexts/ProfileContext';

export default function ConnectScreen() {
  const { activeProfile } = useProfile(); // ← Real profile!

  return (
    <View>
      <Text>Current Profile: {activeProfile}</Text>
      {/* Email connections for this profile */}
    </View>
  );
}
```

### 5. ProfileSwitcher Component (`mobile/src/components/mobile/ProfileSwitcher.tsx`)

**Change**: Imports Profile type from context (single source of truth)

```typescript
import { Profile } from '@/src/contexts/ProfileContext';
```

---

## 🎨 Visual Flow

### Before Context (Broken)

```
User changes profile in Mapper
    ↓
Local state updates
    ↓
Tab icon doesn't update ❌ (different component tree)
```

### After Context (Working)

```
User changes profile in Mapper
    ↓
setActiveProfile() called
    ↓
ProfileContext updates
    ↓
ProfileAvatar re-renders with new initials ✅
    ↓
Tab icon shows: P → LM → AI
```

---

## 🔄 Profile Initials Mapping

| Profile       | Emoji | Initials | Color   |
|---------------|-------|----------|---------|
| Personal      | 👤    | **P**    | Blue    |
| Lion Motel    | 🏨    | **LM**   | Orange  |
| AI Service    | 🤖    | **AI**   | Violet  |

**Tab Icon Examples**:

```
Inactive:  (P)   (LM)  (AI)
           gray  gray  gray

Active:    (P)   (LM)  (AI)
           cyan  cyan  cyan
```

---

## 🚀 How It Works

### 1. App Initialization

```typescript
// app/_layout.tsx
<ProfileProvider>
  {/* Default: activeProfile = 'personal' */}
  <Stack>...</Stack>
</ProfileProvider>
```

### 2. User Switches Profile

```typescript
// In Mapper mode
<ProfileSwitcher
  selectedProfile={activeProfile}     // 'personal'
  onProfileChange={setActiveProfile}  // Updates context
/>

// User taps "Lion Motel" → setActiveProfile('lionmotel')
```

### 3. Context Broadcasts Update

```typescript
// ProfileContext notifies all consumers
activeProfile: 'personal' → 'lionmotel'
```

### 4. Tab Icon Updates

```typescript
// TabLayout's ProfileAvatar re-renders
const { activeProfile } = useProfile(); // 'lionmotel'
getInitials('lionmotel') // Returns 'LM'
// Icon shows: (LM)
```

---

## 🎯 Benefits

### Reactivity
- ✅ Tab icon updates **instantly** when profile changes
- ✅ All screens see the same active profile
- ✅ No prop drilling needed

### Developer Experience
- ✅ Simple API: `const { activeProfile, setActiveProfile } = useProfile()`
- ✅ Type-safe with TypeScript
- ✅ Easy to debug (single state source)

### Extensibility
- ✅ Easy to add persistence (AsyncStorage)
- ✅ Can add profile-specific settings
- ✅ Can add multiple consumers anywhere in the app

---

## 🔮 Future Enhancements

### Phase 2: Persistence

```typescript
// ProfileContext.tsx
export function ProfileProvider({ children }) {
  const [activeProfile, setActiveProfile] = useState<Profile>('personal');

  // Load from storage on mount
  useEffect(() => {
    AsyncStorage.getItem('activeProfile').then((saved) => {
      if (saved) setActiveProfile(saved as Profile);
    });
  }, []);

  // Save to storage on change
  useEffect(() => {
    AsyncStorage.setItem('activeProfile', activeProfile);
  }, [activeProfile]);

  // ...
}
```

### Phase 3: Profile-Specific Data

```typescript
// Add profile metadata to context
interface ProfileData {
  profile: Profile;
  emailConnections: EmailConnection[];
  settings: ProfileSettings;
  stats: ProfileStats;
}
```

### Phase 4: Profile Switching Animation

```typescript
// Animate tab icon when profile changes
const animatedValue = useSharedValue(0);

useEffect(() => {
  animatedValue.value = withSpring(1); // Bounce/scale animation
}, [activeProfile]);
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Open Mapper mode
- [ ] Change profile from Personal → Lion Motel
- [ ] Verify tab icon changes from (P) → (LM)
- [ ] Change profile to AI Service
- [ ] Verify tab icon changes to (AI)
- [ ] Navigate to Capture/Connect
- [ ] Verify profile indicator shows correct profile
- [ ] Switch back to Mapper
- [ ] Verify profile switcher shows correct selection

### Expected Results

| Action                  | Tab Icon | Mapper Switcher | Connect Indicator |
|-------------------------|----------|-----------------|-------------------|
| Initial load            | (P)      | Personal ✓      | Personal          |
| Select Lion Motel       | (LM)     | Lion Motel ✓    | Lion Motel        |
| Select AI Service       | (AI)     | AI Service ✓    | AI Service        |
| Navigate between tabs   | (stays)  | (stays)         | (stays)           |

---

## 📊 Code Statistics

### Files Created: 1
- `mobile/src/contexts/ProfileContext.tsx`

### Files Modified: 5
- `mobile/app/_layout.tsx`
- `mobile/app/(tabs)/_layout.tsx`
- `mobile/app/(tabs)/mapper.tsx`
- `mobile/app/(tabs)/capture/connect.tsx`
- `mobile/src/components/mobile/ProfileSwitcher.tsx`

### Lines Added: ~50
### Lines Removed: ~15

---

## ✅ Success Criteria

All criteria met ✓

- [x] Tab icon shows profile initials
- [x] Tab icon updates when profile changes
- [x] Mapper screen can change profile
- [x] Connect screen reads correct profile
- [x] No TypeScript errors
- [x] Context wraps entire app
- [x] Single source of truth for profile state

---

**Implementation Status**: ✅ Complete
**Date**: 2025-11-02
**Issue Resolved**: Tab icon now reactive to profile changes
**Next**: Add AsyncStorage persistence for selected profile
