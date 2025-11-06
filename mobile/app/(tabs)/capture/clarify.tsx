/**
 * Capture/Clarify Screen - Answer questions for better task decomposition
 * Implements Q&A flow for AI clarifications
 */

import { useState } from 'react';
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

import { submitClarifications } from '@/src/services/captureService';
import type { CaptureResponse, ClarificationNeed } from '@/src/types/capture';

export default function ClarifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse the capture response from navigation params
  const captureResponse: CaptureResponse | null = params.response
    ? JSON.parse(params.response as string)
    : null;

  // State
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!captureResponse) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No clarifications to answer</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const clarifications = captureResponse.clarifications || [];

  /**
   * Handle text input change for a clarification
   */
  const handleAnswerChange = (field: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Check if all required clarifications have answers
   */
  const areAllRequiredAnswered = () => {
    const requiredFields = clarifications
      .filter(c => c.required)
      .map(c => c.field);

    return requiredFields.every(field =>
      answers[field] && answers[field].trim().length > 0
    );
  };

  /**
   * Submit clarification answers
   */
  const handleSubmit = async () => {
    // Validate required fields
    if (!areAllRequiredAnswered()) {
      Alert.alert(
        'Missing Required Fields',
        'Please answer all required questions (marked with *)'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit answers to backend
      const result = await submitClarifications(
        captureResponse.micro_steps,
        answers
      );

      // Check if we have more clarifications
      if (result.clarifications.length > 0) {
        Alert.alert(
          'More Info Needed',
          `We need ${result.clarifications.length} more detail(s).`,
          [
            {
              text: 'Continue',
              onPress: () => {
                // Navigate to clarify again with new response
                router.replace({
                  pathname: '/capture/clarify',
                  params: { response: JSON.stringify(result) },
                });
              },
            },
          ]
        );
      } else {
        // All clarifications answered!
        Alert.alert(
          'All Set! 🎉',
          `Task refined with ${result.micro_steps.length} micro-steps.`,
          [
            {
              text: 'Review & Save',
              onPress: () => {
                // Navigate back to Add screen with updated response
                router.replace({
                  pathname: '/capture/add',
                  params: {
                    clarifiedResponse: JSON.stringify({
                      ...captureResponse,
                      micro_steps: result.micro_steps,
                      clarifications: result.clarifications,
                      ready_to_save: result.ready_to_save,
                    }),
                  },
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Submission Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        [
          {
            text: 'Retry',
            onPress: handleSubmit,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Skip clarifications and use what we have
   */
  const handleSkip = () => {
    Alert.alert(
      'Skip Clarifications?',
      'The task will be created with the information we have. You can refine it later.',
      [
        {
          text: 'Go Back',
          style: 'cancel',
        },
        {
          text: 'Skip Anyway',
          style: 'destructive',
          onPress: () => {
            // Navigate back to Add screen to save as-is
            router.back();
          },
        },
      ]
    );
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
          <Text style={styles.emoji}>❓</Text>
          <Text style={styles.title}>Clarify Details</Text>
          <Text style={styles.subtitle}>
            Answer these questions to get better micro-steps
          </Text>
        </View>

        {/* Task Title */}
        <View style={styles.taskInfo}>
          <Text style={styles.taskLabel}>Task:</Text>
          <Text style={styles.taskTitle}>{captureResponse.task.title}</Text>
        </View>

        {/* Questions */}
        <View style={styles.questionsContainer}>
          <Text style={styles.questionsHeader}>
            {clarifications.length} Question{clarifications.length !== 1 ? 's' : ''}
          </Text>

          {clarifications.map((clarification: ClarificationNeed, index: number) => (
            <View key={clarification.field} style={styles.questionCard}>
              {/* Question number and label */}
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>Q{index + 1}</Text>
                {clarification.required && (
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>REQUIRED</Text>
                  </View>
                )}
              </View>

              {/* Question text */}
              <Text style={styles.questionText}>{clarification.question}</Text>

              {/* Answer input */}
              <TextInput
                style={styles.answerInput}
                placeholder="Type your answer here..."
                placeholderTextColor="#586e75"
                value={answers[clarification.field] || ''}
                onChangeText={(text) => handleAnswerChange(clarification.field, text)}
                multiline
                numberOfLines={3}
                editable={!isSubmitting}
                testID={`answer-input-${clarification.field}`}
              />
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.skipButton]}
            onPress={handleSkip}
            disabled={isSubmitting}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              (!areAllRequiredAnswered() || isSubmitting) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!areAllRequiredAnswered() || isSubmitting}
            testID="submit-button"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Answers</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Progress indicator */}
        {isSubmitting && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#268bd2" />
            <Text style={styles.processingText}>
              Re-analyzing task with your answers...
            </Text>
          </View>
        )}

        {/* Help text */}
        <Text style={styles.helpText}>
          💡 Tip: Be specific! Better answers = better micro-steps
        </Text>
      </ScrollView>
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
    marginBottom: 20,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#93a1a1',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#586e75',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  taskInfo: {
    backgroundColor: '#073642',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  taskLabel: {
    fontSize: 12,
    color: '#586e75',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 18,
    color: '#93a1a1',
    fontWeight: '600',
  },
  questionsContainer: {
    marginBottom: 24,
  },
  questionsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#93a1a1',
    marginBottom: 16,
  },
  questionCard: {
    backgroundColor: '#073642',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#268bd2',
    marginRight: 12,
  },
  requiredBadge: {
    backgroundColor: '#dc322f',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  questionText: {
    fontSize: 16,
    color: '#93a1a1',
    marginBottom: 12,
    lineHeight: 24,
  },
  answerInput: {
    backgroundColor: '#002b36',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#93a1a1',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#586e75',
  },
  buttonContainer: {
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
  skipButton: {
    backgroundColor: '#073642',
    borderWidth: 1,
    borderColor: '#586e75',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#93a1a1',
  },
  submitButton: {
    backgroundColor: '#268bd2',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonDisabled: {
    backgroundColor: '#073642',
    opacity: 0.5,
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
  },
  processingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#93a1a1',
    textAlign: 'center',
  },
  helpText: {
    fontSize: 14,
    color: '#586e75',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#dc322f',
    textAlign: 'center',
    marginTop: 100,
  },
  backButton: {
    backgroundColor: '#268bd2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
