# Capture/Add Screen Implementation Plan
## Mobile App - Phase 1 Priority

**Date**: November 4, 2025
**Priority**: 🔴 **HIGHEST** (Critical Path Blocker)
**Estimated Time**: 2 days
**File**: `mobile/app/(tabs)/capture/add.tsx`

---

## Overview

### Current Status
**❌ Placeholder Only** - Screen displays static text with no functionality

**Current Code**:
```typescript
// mobile/app/(tabs)/capture/add.tsx (CURRENT)
export default function AddScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Add</Text>
      <Text style={styles.description}>
        Quick-capture tasks, events, habits, and notes.{'\n'}
        Immediate capture without overthinking.
      </Text>
    </View>
  );
}
```

### Goal
Transform into a fully functional brain-dump capture interface with:
- Text input
- Voice input (future)
- AI decomposition
- Micro-step preview
- Save to database

---

## Implementation Breakdown

### Phase 1A: Basic Text Input (4 hours)

#### 1. Add State Management

```typescript
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function AddScreen() {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [captureResponse, setCaptureResponse] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // ... (rest of implementation)
}
```

#### 2. Add Input UI Component

```typescript
<View style={styles.container}>
  <StatusBar style="light" />

  {/* Header */}
  <View style={styles.header}>
    <Text style={styles.title}>🎤 Quick Capture</Text>
    <Text style={styles.subtitle}>
      Brain dump anything. We'll handle the rest.
    </Text>
  </View>

  {/* Input Area */}
  <View style={styles.inputContainer}>
    <TextInput
      style={styles.input}
      placeholder="What's on your mind?"
      placeholderTextColor="#586e75"
      value={inputText}
      onChangeText={setInputText}
      multiline
      numberOfLines={4}
      autoFocus
      returnKeyType="done"
      blurOnSubmit
    />

    {/* Character Counter */}
    <Text style={styles.charCount}>
      {inputText.length} characters
    </Text>
  </View>

  {/* Action Buttons */}
  <View style={styles.buttonRow}>
    <TouchableOpacity
      style={[styles.button, styles.clearButton]}
      onPress={() => setInputText('')}
      disabled={inputText.length === 0}
    >
      <Text style={styles.buttonText}>Clear</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[
        styles.button,
        styles.captureButton,
        inputText.length === 0 && styles.buttonDisabled
      ]}
      onPress={handleCapture}
      disabled={inputText.length === 0 || isProcessing}
    >
      <Text style={styles.buttonTextPrimary}>
        {isProcessing ? 'Processing...' : 'Capture'}
      </Text>
    </TouchableOpacity>
  </View>
</View>
```

#### 3. Add Styles

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002b36',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#93a1a1',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#586e75',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#073642',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#93a1a1',
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#586e75',
    textAlign: 'right',
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#073642',
    borderWidth: 1,
    borderColor: '#586e75',
  },
  captureButton: {
    backgroundColor: '#268bd2',
  },
  buttonDisabled: {
    backgroundColor: '#073642',
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#93a1a1',
  },
  buttonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
```

---

### Phase 1B: API Integration (4 hours)

#### 4. Create API Service

**New File**: `mobile/src/services/captureService.ts`

```typescript
// mobile/src/services/captureService.ts
const API_BASE_URL = 'http://localhost:8000';

export interface CaptureRequest {
  query: string;
  user_id: string;
  mode: 'auto' | 'manual' | 'clarify';
}

export interface MicroStep {
  step_id: string;
  description: string;
  estimated_minutes: number;
  delegation_mode: string;
  leaf_type: string;
  icon?: string;
  short_label?: string;
  tags?: string[];
}

export interface CaptureResponse {
  task: {
    task_id: string;
    title: string;
    description: string;
    estimated_minutes: number;
    priority: string;
  };
  micro_steps: MicroStep[];
  clarifications: any[];
  ready_to_save: boolean;
  mode: string;
}

export async function captureTask(query: string, userId: string): Promise<CaptureResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/capture/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        user_id: userId,
        mode: 'auto',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Capture failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Capture API Error:', error);
    throw error;
  }
}

export async function saveCapture(
  task: any,
  microSteps: MicroStep[],
  userId: string,
  projectId: string = 'default-project'
): Promise<{ success: boolean; task_id: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/capture/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task,
        micro_steps: microSteps,
        user_id: userId,
        project_id: projectId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Save failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Save API Error:', error);
    throw error;
  }
}
```

#### 5. Implement Capture Handler

```typescript
// mobile/app/(tabs)/capture/add.tsx

import { captureTask, saveCapture } from '@/src/services/captureService';

export default function AddScreen() {
  // ... (state from Phase 1A)

  const handleCapture = async () => {
    if (inputText.trim().length === 0) {
      Alert.alert('Empty Input', 'Please enter a task to capture');
      return;
    }

    setIsProcessing(true);

    try {
      // Call capture API
      const response = await captureTask(inputText, 'user_123'); // TODO: Get real user_id

      setCaptureResponse(response);

      // Check if clarifications needed
      if (response.clarifications.length > 0) {
        // TODO: Navigate to clarify screen
        Alert.alert(
          'Clarifications Needed',
          'Some questions need answers before we can break this down',
          [
            {
              text: 'Answer Now',
              onPress: () => {
                // Navigate to clarify screen with response
                // router.push({ pathname: '/capture/clarify', params: { response } });
              }
            },
            {
              text: 'Skip',
              style: 'cancel',
            }
          ]
        );
      } else {
        // Show breakdown modal
        setShowBreakdown(true);
      }
    } catch (error) {
      Alert.alert('Capture Failed', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTask = async () => {
    if (!captureResponse) return;

    try {
      const result = await saveCapture(
        captureResponse.task,
        captureResponse.micro_steps,
        'user_123' // TODO: Get real user_id
      );

      // Success!
      Alert.alert(
        'Task Saved! 🎉',
        `${captureResponse.micro_steps.length} micro-steps created`,
        [
          {
            text: 'View in Scout',
            onPress: () => {
              // TODO: Navigate to Scout mode
              // router.push('/scout');
            }
          },
          {
            text: 'Add Another',
            onPress: () => {
              setInputText('');
              setCaptureResponse(null);
              setShowBreakdown(false);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Save Failed', error.message);
    }
  };

  // ... (rest of component)
}
```

---

### Phase 1C: TaskBreakdownModal Integration (3 hours)

#### 6. Import Existing Component

```typescript
// mobile/app/(tabs)/capture/add.tsx

import TaskBreakdownModal from '@/src/components/mobile/modals/TaskBreakdownModal';
import AsyncJobTimeline from '@/src/components/shared/AsyncJobTimeline';
```

#### 7. Add Modal to UI

```typescript
export default function AddScreen() {
  // ... (previous code)

  return (
    <View style={styles.container}>
      {/* ... (input UI from Phase 1A) */}

      {/* Task Breakdown Modal */}
      {showBreakdown && captureResponse && (
        <TaskBreakdownModal
          isOpen={showBreakdown}
          onClose={() => setShowBreakdown(false)}
          captureResponse={captureResponse}
          onSaveTask={handleSaveTask}
          isProcessing={false}
        />
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <AsyncJobTimeline
            micro_steps={[]}
            isProcessing={true}
          />
          <Text style={styles.processingText}>
            Breaking down your task into micro-steps...
          </Text>
        </View>
      )}
    </View>
  );
}

// Add styles for overlay
const styles = StyleSheet.create({
  // ... (previous styles)

  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 43, 54, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  processingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#93a1a1',
    textAlign: 'center',
  },
});
```

---

### Phase 1D: Voice Input (Optional - 2 hours)

#### 8. Add Voice Recording Button

**Install Dependencies**:
```bash
cd mobile
npx expo install expo-av
```

**Add Voice Button**:
```typescript
import { Audio } from 'expo-av';

export default function AddScreen() {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      Alert.alert('Failed to start recording', err.message);
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    // TODO: Send to POST /api/v1/mobile/voice-process
    // For now, just show alert
    Alert.alert('Voice Recording', 'Voice input coming soon!');

    setRecording(null);
  }

  return (
    <View style={styles.container}>
      {/* ... (existing UI) */}

      {/* Voice Button */}
      <TouchableOpacity
        style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={styles.voiceIcon}>
          {isRecording ? '⏹️' : '🎤'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (previous styles)

  voiceButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#268bd2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  voiceButtonActive: {
    backgroundColor: '#dc322f',
  },
  voiceIcon: {
    fontSize: 28,
  },
});
```

---

## Testing Checklist

### Manual Testing Steps

1. **Text Input**:
   - [ ] Open Capture/Add screen
   - [ ] Type "Buy groceries for the week"
   - [ ] Verify character counter updates
   - [ ] Press "Clear" → text clears
   - [ ] Type again and press "Capture"

2. **API Integration**:
   - [ ] Verify API call to POST /api/v1/capture/
   - [ ] Check network request in console
   - [ ] Verify response contains task + micro_steps
   - [ ] Check for error handling (network failure)

3. **Processing State**:
   - [ ] Verify "Processing..." text shows
   - [ ] AsyncJobTimeline displays during capture
   - [ ] Button disabled during processing

4. **Task Breakdown Modal**:
   - [ ] Modal opens after successful capture
   - [ ] Displays task title and description
   - [ ] Shows all micro-steps with icons
   - [ ] Displays total estimated time
   - [ ] "Save Task" button works

5. **Save Flow**:
   - [ ] Press "Save Task" in modal
   - [ ] Verify API call to POST /api/v1/capture/save
   - [ ] Success alert shows
   - [ ] Input clears for next capture

6. **Edge Cases**:
   - [ ] Empty input → button disabled
   - [ ] Very long input (500+ chars) → works
   - [ ] Network timeout → error shown
   - [ ] API returns error → graceful handling
   - [ ] Rapid button presses → no duplicate calls

---

## Dependencies

### Required Components
- ✅ `TaskBreakdownModal` - Already exists in `frontend/src/components/mobile/modals/`
- ✅ `AsyncJobTimeline` - Already exists in `frontend/src/components/shared/`

### Required Services
- ❌ `captureService.ts` - **Need to create**
- ⚠️ User authentication - Use hardcoded "user_123" for now

### Optional Dependencies
- ⚠️ `expo-av` - For voice recording (Phase 1D only)

---

## File Structure After Implementation

```
mobile/
├── app/
│   └── (tabs)/
│       └── capture/
│           ├── add.tsx ← UPDATED (from placeholder)
│           ├── clarify.tsx (unchanged placeholder)
│           └── connect.tsx (working OAuth)
├── src/
│   ├── components/
│   │   └── mobile/
│   │       └── modals/
│   │           └── TaskBreakdownModal.tsx ✅ (already exists)
│   └── services/
│       └── captureService.ts ← NEW FILE
└── package.json
```

---

## API Endpoints Used

| Endpoint | Purpose | Status |
|----------|---------|--------|
| POST /api/v1/capture/ | Initial capture & decomposition | ✅ Ready |
| POST /api/v1/capture/save | Save finalized task | ✅ Ready |
| POST /api/v1/mobile/voice-process | Voice transcription | ⚠️ Future |

---

## Success Criteria

**Minimum Viable Implementation** (Must Have):
- [ ] User can type task description
- [ ] Press "Capture" button calls API
- [ ] TaskBreakdownModal shows result
- [ ] User can save task to database
- [ ] Clear/reset for next capture

**Enhanced Implementation** (Nice to Have):
- [ ] Voice recording button
- [ ] Clarification flow handling
- [ ] Auto-save on success
- [ ] Navigate to Scout after save

---

## Timeline Breakdown

### Day 1 (8 hours)
- **Morning (4h)**: Phase 1A + 1B (Text input + API integration)
- **Afternoon (4h)**: Phase 1C (Modal integration) + Testing

### Day 2 (4 hours)
- **Morning (2h)**: Polish, error handling, edge cases
- **Afternoon (2h)**: Phase 1D (Voice input - optional)

**Total**: 2 days (12 hours)

---

## Risks & Mitigation

### Risk 1: API Connection Issues
**Mitigation**: Add retry logic, show helpful error messages, offline mode detection

### Risk 2: TaskBreakdownModal Not Mobile-Compatible
**Mitigation**: Already verified component exists and is mobile-ready (React Native compatible)

### Risk 3: Performance Issues with Large Responses
**Mitigation**: Limit micro-steps display to first 10, add "Show More" button

---

## Next Steps After Completion

Once Capture/Add is working:

1. **Verify Clarify Screen** (1 day)
   - Check if functional or needs rebuild
   - Integrate with Capture flow

2. **Implement Scout Mode** (3 days)
   - Task list from GET /api/v1/tasks
   - Filters and search
   - Navigation to Hunter

3. **Implement Hunter Mode** (3 days)
   - Single task focus
   - Swipe gestures
   - XP system

---

## Code Examples for Common Issues

### Issue: API Base URL Different in Production

```typescript
// mobile/src/config/api.ts (NEW FILE)
const getApiBaseUrl = () => {
  if (__DEV__) {
    return 'http://localhost:8000';
  }
  return process.env.EXPO_PUBLIC_API_URL || 'https://api.proxyagent.com';
};

export const API_BASE_URL = getApiBaseUrl();
```

### Issue: User ID Management

```typescript
// mobile/src/contexts/UserContext.tsx (NEW FILE)
import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [userId, setUserId] = useState('user_123'); // Hardcoded for now

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
```

**Usage**:
```typescript
import { useUser } from '@/src/contexts/UserContext';

export default function AddScreen() {
  const { userId } = useUser();

  const handleCapture = async () => {
    const response = await captureTask(inputText, userId);
    // ...
  };
}
```

---

## Final Implementation Code

**Complete File**: `mobile/app/(tabs)/capture/add.tsx`

See [CAPTURE_ADD_COMPLETE_IMPLEMENTATION.md](./CAPTURE_ADD_COMPLETE_IMPLEMENTATION.md) for the full 300-line implementation.

---

**Status**: Implementation plan complete ✅
**Ready for**: Development 🚀
**Estimated Completion**: 2 days

For API reference, see: [API_INTEGRATION.md](./API_INTEGRATION.md)
For overall status, see: [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
