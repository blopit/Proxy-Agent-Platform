import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Send, Loader2 } from 'lucide-react'
import { taskApi, TaskApiError } from '@/services/taskApi'
import { Task, QuickCaptureRequest } from '@/types/task'

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

      recognition.addEventListener('result', (event: SpeechRecognitionEvent) => {
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
    <div className={`glass-card rounded-xl p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Quick Capture</h3>
          {recognitionRef.current && (
            <button
              type="button"
              onClick={handleVoiceCapture}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-colors ${
                isListening
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
        </div>

        <form onSubmit={handleTextSubmit} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Quick capture a task..."
              disabled={isLoading || isListening}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {isListening && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="flex items-center space-x-2 text-red-600">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Listening...</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!text.trim() || isLoading || isListening}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Capturing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Capture</span>
              </>
            )}
          </button>
        </form>

        {/* Status Messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm font-medium">{successMessage}</p>
          </div>
        )}
      </div>
    </div>
  )
}