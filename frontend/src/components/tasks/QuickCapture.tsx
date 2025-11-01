'use client';

import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Send, Loader2 } from 'lucide-react'
import { taskApi, TaskApiError } from '@/services/taskApi'
import { Task, QuickCaptureRequest } from '@/types/task'
import {
  spacing,
  fontSize,
  fontWeight,
  lineHeight,
  semanticColors,
  colors,
  borderRadius,
  duration,
  iconSize
} from '@/lib/design-system'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface QuickCaptureProps {
  userId: string
  onTaskCreated: (task: Task) => void
  className?: string
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
      }
      isFinal: boolean
    }
  }
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    start(): void
    stop(): void
    abort(): void
  }
}

export function QuickCapture({ userId, onTaskCreated, className = '' }: QuickCaptureProps) {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>()

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const shouldReduceMotion = useReducedMotion()

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.warn('Geolocation not available:', error)
        }
      )
    }
  }, [])

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.addEventListener('result', (event: any) => {
        const transcript = event.results[0][0].transcript
        setText(transcript)
        setIsListening(false)
      })

      recognition.addEventListener('end', () => {
        setIsListening(false)
      })

      recognition.addEventListener('error', () => {
        setIsListening(false)
        setError('Voice recognition failed. Please try typing instead.')
      })

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const clearMessages = () => {
    setError(null)
    setSuccessMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent, isVoiceInput = false) => {
    e.preventDefault()
    if (!text.trim() || isLoading) return

    clearMessages()
    setIsLoading(true)

    try {
      const startTime = Date.now()

      const request: QuickCaptureRequest = {
        text: text.trim(),
        user_id: userId,
        voice_input: isVoiceInput,
      }

      if (location) {
        request.location = location
      }

      const response = await taskApi.quickCapture(request)

      const processingTime = Date.now() - startTime
      const serverTime = response.processing_time_ms

      // Show success message with timing
      if (serverTime < 2000) {
        setSuccessMessage(`Captured in ${(serverTime / 1000).toFixed(1)}s ⚡`)
      } else {
        setSuccessMessage(`Took ${(serverTime / 1000).toFixed(1)}s`)
      }

      onTaskCreated(response.task)
      setText('')

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      if (err instanceof TaskApiError) {
        setError(`Failed to capture task: ${err.message}`)
      } else {
        setError('Failed to capture task. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceCapture = () => {
    if (!recognitionRef.current) {
      setError('Voice recognition not supported in this browser')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      clearMessages()
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    handleSubmit(e, false)
  }

  // Submit voice input when text is populated from speech recognition
  useEffect(() => {
    if (text && isListening === false && recognitionRef.current) {
      // Small delay to ensure speech recognition has fully processed
      setTimeout(() => {
        const form = inputRef.current?.form
        if (form) {
          handleSubmit(new Event('submit') as any, true)
        }
      }, 100)
    }
  }, [text, isListening])

  return (
    <div
      className={`glass-card ${className}`}
      style={{
        borderRadius: borderRadius.lg,  // 12px
        padding: spacing[6],            // 24px (mobile-friendly)
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
        {/* Header with voice button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3
            style={{
              fontSize: fontSize.lg,           // 18px
              fontWeight: fontWeight.semibold, // 600
              lineHeight: lineHeight.normal,   // 1.5
              color: semanticColors.text.primary,
            }}
          >
            Quick Capture
          </h3>
          {recognitionRef.current && (
            <button
              type="button"
              onClick={handleVoiceCapture}
              disabled={isLoading}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              style={{
                minWidth: '44px',   // Touch target
                minHeight: '44px',  // Touch target
                padding: spacing[2], // 8px
                borderRadius: borderRadius.base,  // 8px
                backgroundColor: isListening
                  ? semanticColors.error.light
                  : semanticColors.accent.secondary,
                color: isListening
                  ? semanticColors.error.dark
                  : colors.blue,  // Scout mode (capture)
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
                transition: shouldReduceMotion ? 'none' : `all ${duration.fast}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
            >
              {isListening ? (
                <MicOff style={{ width: iconSize.sm, height: iconSize.sm }} />
              ) : (
                <Mic style={{ width: iconSize.sm, height: iconSize.sm }} />
              )}
            </button>
          )}
        </div>

        <form
          onSubmit={handleTextSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}
        >
          {/* Input field with mobile-first design */}
          <div style={{ position: 'relative' }}>
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Quick capture a task..."
              disabled={isLoading || isListening}
              style={{
                width: '100%',
                minHeight: '44px',              // Touch target
                padding: `${spacing[3]}px ${spacing[4]}px`,  // 12px 16px
                fontSize: fontSize.base,        // 16px (prevents iOS zoom)
                fontWeight: fontWeight.regular, // 400
                lineHeight: lineHeight.normal,  // 1.5
                color: semanticColors.text.primary,
                backgroundColor: semanticColors.bg.primary,
                border: `1px solid ${semanticColors.border.default}`,
                borderRadius: borderRadius.base,  // 8px
                outline: 'none',
                cursor: isLoading || isListening ? 'not-allowed' : 'text',
                opacity: isLoading || isListening ? 0.5 : 1,
                transition: shouldReduceMotion ? 'none' : `all ${duration.normal}`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.blue;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.blue}4D`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = semanticColors.border.default;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {isListening && (
              <div
                style={{
                  position: 'absolute',
                  right: spacing[3],  // 12px
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],  // 8px
                    color: semanticColors.error.default,
                  }}
                >
                  <div
                    style={{
                      width: spacing[2],   // 8px
                      height: spacing[2],  // 8px
                      backgroundColor: semanticColors.error.default,
                      borderRadius: borderRadius.full,
                      animation: shouldReduceMotion ? 'none' : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }}
                  />
                  <span
                    style={{
                      fontSize: fontSize.sm,           // 14px
                      fontWeight: fontWeight.medium,   // 500
                    }}
                  >
                    Listening...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Submit button with touch target */}
          <button
            type="submit"
            disabled={!text.trim() || isLoading || isListening}
            style={{
              width: '100%',
              minHeight: '44px',              // Touch target
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[2],                // 8px
              backgroundColor: colors.cyan,   // Capture mode color
              color: semanticColors.text.inverse,
              padding: `${spacing[3]}px ${spacing[4]}px`,  // 12px 16px
              borderRadius: borderRadius.base,  // 8px
              border: 'none',
              fontSize: fontSize.base,        // 16px
              fontWeight: fontWeight.medium,  // 500
              cursor: (!text.trim() || isLoading || isListening) ? 'not-allowed' : 'pointer',
              opacity: (!text.trim() || isLoading || isListening) ? 0.5 : 1,
              transition: shouldReduceMotion ? 'none' : `all ${duration.normal}`,
            }}
            onFocus={(e) => {
              if (text.trim() && !isLoading && !isListening) {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.cyan}4D`;
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
            onMouseEnter={(e) => {
              if (text.trim() && !isLoading && !isListening) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (text.trim() && !isLoading && !isListening) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            {isLoading ? (
              <>
                <Loader2 style={{ width: iconSize.sm, height: iconSize.sm, animation: 'spin 1s linear infinite' }} />
                <span>Capturing...</span>
              </>
            ) : (
              <>
                <Send style={{ width: iconSize.sm, height: iconSize.sm }} />
                <span>Capture</span>
              </>
            )}
          </button>
        </form>

        {/* Error message */}
        {error && (
          <div
            style={{
              padding: spacing[3],  // 12px
              backgroundColor: semanticColors.error.light,
              border: `1px solid ${semanticColors.error.default}`,
              borderRadius: borderRadius.base,  // 8px
            }}
          >
            <p
              style={{
                color: semanticColors.error.dark,
                fontSize: fontSize.sm,  // 14px
                margin: 0,
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div
            style={{
              padding: spacing[3],  // 12px
              backgroundColor: semanticColors.success.light,
              border: `1px solid ${semanticColors.success.default}`,
              borderRadius: borderRadius.base,  // 8px
            }}
          >
            <p
              style={{
                color: semanticColors.success.dark,
                fontSize: fontSize.sm,           // 14px
                fontWeight: fontWeight.medium,   // 500
                margin: 0,
              }}
            >
              {successMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}