/**
 * useVoiceInput - Custom hook for voice-to-text using Web Speech API
 *
 * Provides voice recognition capabilities for both mobile and desktop browsers.
 * Handles browser compatibility, permissions, and error states.
 *
 * @example
 * const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceInput({
 *   onTranscript: (text) => setInputValue(text)
 * });
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceInputOptions {
  onTranscript?: (text: string) => void;
  onError?: (error: VoiceInputError) => void;
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface VoiceInputError {
  type: 'not-supported' | 'permission-denied' | 'network-error' | 'no-speech' | 'aborted' | 'unknown';
  message: string;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
  error: VoiceInputError | null;
}

// Web Speech API type definitions (not included in TypeScript by default)
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

// Extend Window interface for webkit prefix
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const {
    onTranscript,
    onError,
    lang = 'en-US',
    continuous = true, // Keep recording until explicitly stopped
    interimResults = true,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<VoiceInputError | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();

      const recognition = recognitionRef.current;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;

      // Event handlers
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptText = result[0].transcript;

          if (result.isFinal) {
            final += transcriptText + ' ';
          } else {
            interim += transcriptText;
          }
        }

        // Update interim transcript
        if (interim) {
          setInterimTranscript(interim);
        }

        // Update final transcript
        if (final) {
          setTranscript((prev) => {
            const newTranscript = prev + final;
            onTranscript?.(newTranscript);
            return newTranscript;
          });
          setInterimTranscript('');
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);

        let errorInfo: VoiceInputError;

        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            errorInfo = {
              type: 'permission-denied',
              message: 'Microphone permission denied. Please allow microphone access.',
            };
            break;
          case 'network':
            errorInfo = {
              type: 'network-error',
              message: 'Network error. Please check your connection.',
            };
            break;
          case 'no-speech':
            errorInfo = {
              type: 'no-speech',
              message: 'No speech detected. Please try again.',
            };
            break;
          case 'aborted':
            errorInfo = {
              type: 'aborted',
              message: 'Voice input was cancelled.',
            };
            break;
          default:
            errorInfo = {
              type: 'unknown',
              message: `Voice recognition error: ${event.error}`,
            };
        }

        setError(errorInfo);
        setIsListening(false);
        onError?.(errorInfo);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };
    } else {
      const notSupportedError: VoiceInputError = {
        type: 'not-supported',
        message: 'Voice input is not supported in this browser.',
      };
      setError(notSupportedError);
      onError?.(notSupportedError);
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [lang, continuous, interimResults, onTranscript, onError]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;

    try {
      setError(null);
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting voice recognition:', error);

      // If already started, stop and restart
      if (error instanceof Error && error.message.includes('already started')) {
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current?.start();
        }, 100);
      } else {
        const unknownError: VoiceInputError = {
          type: 'unknown',
          message: 'Failed to start voice recognition.',
        };
        setError(unknownError);
        onError?.(unknownError);
      }
    }
  }, [isSupported, onError]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  };
}
