/**
 * Capture/Add Screen - Brain dump task capture with AI decomposition
 * Implements TDD approach with comprehensive error handling
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { captureTask, saveCapture } from '@/src/services/captureService';
import type { CaptureResponse } from '@/src/types/capture';

// TODO: Import these components when they're converted to mobile
// import TaskBreakdownModal from '@/src/components/mobile/modals/TaskBreakdownModal';
// import AsyncJobTimeline from '@/src/components/shared/AsyncJobTimeline';

export default function AddScreen() {
  // State management
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [captureResponse, setCaptureResponse] = useState<CaptureResponse | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const router = useRouter();
  const params = useLocalSearchParams();

  // TODO: Get real user_id from auth context
  const USER_ID = 'user_123';

  /**
   * Handle clarified response from clarify screen
   * When user returns from clarify screen with updated response, show breakdown
   */
  useEffect(() => {
    if (params.clarifiedResponse) {
      const clarified = JSON.parse(params.clarifiedResponse as string);
      setCaptureResponse(clarified);
      setShowBreakdown(true);
    }
  }, [params.clarifiedResponse]);

  /**
   * Handle capture button press
   * TDD: Covered by tests for loading state, API call, success/error handling
   */
  const handleCapture = async () => {
    // Validation
    if (inputText.trim().length === 0) {
      Alert.alert('Empty Input', 'Please enter a task to capture');
      return;
    }

    setIsProcessing(true);

    try {
      // Call capture API
      const response = await captureTask(inputText, USER_ID);
      setCaptureResponse(response);

      // Check if clarifications needed
      if (response.clarifications.length > 0) {
        Alert.alert(
          'Clarifications Needed',
          `We need ${response.clarifications.length} more detail(s) to break this down perfectly.`,
          [
            {
              text: 'Answer Now',
              onPress: () => {
                // Navigate to clarify screen with response
                router.push({
                  pathname: '/capture/clarify',
                  params: { response: JSON.stringify(response) },
                });
              },
            },
            {
              text: 'Skip for Now',
              style: 'cancel',
              onPress: () => {
                // Show breakdown anyway
                setShowBreakdown(true);
              },
            },
          ]
        );
      } else {
        // Show breakdown modal
        setShowBreakdown(true);
      }
    } catch (error) {
      Alert.alert(
        'Capture Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        [
          {
            text: 'Retry',
            onPress: handleCapture,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle save task button press from modal
   * TDD: Covered by tests for API call, success handling, navigation
   */
  const handleSaveTask = async () => {
    if (!captureResponse) return;

    try {
      const result = await saveCapture(
        captureResponse.task,
        captureResponse.micro_steps,
        USER_ID
      );

      // Success!
      Alert.alert(
        'Task Saved! 🎉',
        `Created ${result.total_steps} micro-steps. Ready to execute!`,
        [
          {
            text: 'View in Scout',
            onPress: () => {
              // Navigate to Scout mode
              router.push('/scout');
            },
          },
          {
            text: 'Add Another',
            onPress: () => {
              // Reset for next capture
              setInputText('');
              setCaptureResponse(null);
              setShowBreakdown(false);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Save Failed',
        error instanceof Error ? error.message : 'Failed to save task',
        [
          {
            text: 'Retry',
            onPress: handleSaveTask,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  /**
   * Clear input text
   * TDD: Covered by tests for button functionality
   */
  const handleClear = () => {
    setInputText('');
  };

  /**
   * Close breakdown modal
   */
  const handleCloseBreakdown = () => {
    setShowBreakdown(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🎤</Text>
          <Text style={styles.title}>Quick Capture</Text>
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
            numberOfLines={6}
            autoFocus
            returnKeyType="done"
            blurOnSubmit
            editable={!isProcessing}
            testID="capture-input"
          />

          {/* Character Counter */}
          <Text style={styles.charCount}>{inputText.length} characters</Text>
        </View>

        {/* Hint Text */}
        <Text style={styles.hint}>
          💡 Tip: Be specific! "Buy milk" → "Buy organic milk from Whole Foods before Friday"
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={handleClear}
            disabled={inputText.length === 0 || isProcessing}
            testID="clear-button"
          >
            <Text
              style={[
                styles.buttonText,
                (inputText.length === 0 || isProcessing) && styles.buttonTextDisabled,
              ]}
            >
              Clear
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.captureButton,
              (inputText.length === 0 || isProcessing) && styles.buttonDisabled,
            ]}
            onPress={handleCapture}
            disabled={inputText.length === 0 || isProcessing}
            testID="capture-button"
          >
            {isProcessing ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonTextPrimary}>Capture</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Processing Indicator */}
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#268bd2" />
            <Text style={styles.processingText}>Breaking down your task into micro-steps...</Text>
            <Text style={styles.processingSubtext}>This usually takes 2-3 seconds</Text>
          </View>
        )}

        {/* Breakdown Preview (when response ready but modal closed) */}
        {captureResponse && !showBreakdown && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>✅ Task Analyzed</Text>
            <Text style={styles.previewText}>
              {captureResponse.micro_steps.length} micro-steps created
            </Text>
            <TouchableOpacity
              style={styles.previewButton}
              onPress={() => setShowBreakdown(true)}
            >
              <Text style={styles.previewButtonText}>View Breakdown</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Task Breakdown Modal */}
      {/* TODO: Uncomment when TaskBreakdownModal is converted to mobile */}
      {/* {showBreakdown && captureResponse && (
        <TaskBreakdownModal
          isOpen={showBreakdown}
          onClose={handleCloseBreakdown}
          captureResponse={captureResponse}
          onSaveTask={handleSaveTask}
          isProcessing={false}
        />
      )} */}

      {/* Temporary Modal Replacement */}
      {showBreakdown && captureResponse && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{captureResponse.task.title}</Text>
              <Text style={styles.modalSubtitle}>
                {captureResponse.task.estimated_minutes} minutes total
              </Text>

              <View style={styles.stepsContainer}>
                <Text style={styles.stepsHeader}>
                  {captureResponse.micro_steps.length} Micro-Steps:
                </Text>
                {captureResponse.micro_steps.map((step, index) => (
                  <View key={step.step_id} style={styles.stepItem}>
                    <Text style={styles.stepNumber}>{index + 1}.</Text>
                    <Text style={styles.stepIcon}>{step.icon || '▶️'}</Text>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepDescription}>{step.description}</Text>
                      <Text style={styles.stepTime}>{step.estimated_minutes} min</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButtonSecondary} onPress={handleCloseBreakdown}>
                  <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButtonPrimary} onPress={handleSaveTask}>
                  <Text style={styles.modalButtonTextPrimary}>Save Task</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002b36',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
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
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: '#073642',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    minHeight: 180,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#93a1a1',
    textAlignVertical: 'top',
    minHeight: 140,
  },
  charCount: {
    fontSize: 12,
    color: '#586e75',
    textAlign: 'right',
    marginTop: 8,
  },
  hint: {
    fontSize: 14,
    color: '#586e75',
    fontStyle: 'italic',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
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
  buttonTextDisabled: {
    opacity: 0.5,
  },
  buttonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#93a1a1',
    textAlign: 'center',
  },
  processingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#586e75',
    textAlign: 'center',
  },
  previewContainer: {
    backgroundColor: '#073642',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#859900',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#93a1a1',
    marginBottom: 12,
  },
  previewButton: {
    backgroundColor: '#268bd2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  previewButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Temporary modal styles (replace with actual TaskBreakdownModal)
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#002b36',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#93a1a1',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#586e75',
    marginBottom: 20,
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepsHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#93a1a1',
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: '#073642',
    padding: 12,
    borderRadius: 8,
  },
  stepNumber: {
    fontSize: 16,
    color: '#586e75',
    marginRight: 8,
    width: 20,
  },
  stepIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  stepContent: {
    flex: 1,
  },
  stepDescription: {
    fontSize: 16,
    color: '#93a1a1',
    marginBottom: 4,
  },
  stepTime: {
    fontSize: 12,
    color: '#586e75',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButtonSecondary: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#073642',
    borderWidth: 1,
    borderColor: '#586e75',
  },
  modalButtonPrimary: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#268bd2',
  },
  modalButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#93a1a1',
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
