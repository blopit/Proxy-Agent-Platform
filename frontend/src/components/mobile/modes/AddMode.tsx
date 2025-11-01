/**
 * AddMode - Executive Function-Optimized Capture Interface
 *
 * **EF Principle**: Reduce task initiation friction through multiple low-barrier entry points
 *
 * Features:
 * - Multi-modal input (text, voice, camera, image)
 * - Type-specific capture (Task, Habit, Event, Goal, Shopping, Data)
 * - Context-aware suggestions
 * - History as external memory
 * - One-tap quick actions
 *
 * ADHD-Optimized:
 * - Default to least friction (text input immediately visible)
 * - Progressive enhancement (voice/camera when typing is hard)
 * - Chunking (clear type categories)
 * - Memory aid (history tab)
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Camera,
  Image as ImageIcon,
  Type,
  Clock,
  Sparkles,
  Plus,
  CheckSquare,
  Repeat,
  Calendar,
  Target,
  ShoppingCart,
  Database,
} from 'lucide-react';
import { spacing, fontSize, borderRadius, iconSize, semanticColors, colors } from '@/lib/design-system';
import Ticker from '@/components/mobile/core/Ticker';

// ============================================================================
// Types
// ============================================================================

export type CaptureType = 'task' | 'habit' | 'event' | 'goal' | 'shopping' | 'data';

export interface CaptureItem {
  id: string;
  type: CaptureType;
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AddModeProps {
  onCapture?: (item: CaptureItem) => void;
  onCancel?: () => void;
  initialType?: CaptureType;
  suggestionsVisible?: boolean;
  suggestions?: string[];
}

// ============================================================================
// Capture Type Configuration
// ============================================================================

const CAPTURE_TYPES = {
  task: {
    icon: CheckSquare,
    label: 'Task',
    color: semanticColors.accent.secondary, // blue
    placeholder: 'What needs to be done?',
    examples: [
      'Review pull request for authentication module',
      'Schedule dentist appointment for next week',
      'Buy groceries: milk, eggs, bread',
    ],
  },
  habit: {
    icon: Repeat,
    label: 'Habit',
    color: semanticColors.accent.success, // green
    placeholder: 'What habit do you want to build?',
    examples: [
      'Exercise for 30 minutes every morning',
      'Read 10 pages before bed',
      'Drink water every hour',
    ],
  },
  event: {
    icon: Calendar,
    label: 'Event',
    color: colors.violet,
    placeholder: 'What event do you want to remember?',
    examples: [
      'Team standup meeting at 10am tomorrow',
      'Birthday party on Saturday',
      'Conference call with client at 2pm',
    ],
  },
  goal: {
    icon: Target,
    label: 'Goal',
    color: colors.orange,
    placeholder: 'What goal do you want to achieve?',
    examples: [
      'Launch new product by end of quarter',
      'Learn Spanish to conversational level',
      'Run a 5K marathon',
    ],
  },
  shopping: {
    icon: ShoppingCart,
    label: 'Shopping',
    color: semanticColors.accent.primary, // cyan
    placeholder: 'What do you need to buy?',
    examples: [
      'Milk, eggs, bread, coffee',
      'New running shoes',
      'Birthday gift for mom',
    ],
  },
  data: {
    icon: Database,
    label: 'Data',
    color: semanticColors.text.secondary,
    placeholder: 'Capture any information...',
    examples: [
      'Interesting article: How to improve focus',
      'Quote: "The only way to do great work is to love what you do"',
      'Random idea: What if we combined X with Y?',
    ],
  },
} as const;

// ============================================================================
// Component
// ============================================================================

export default function AddMode({
  onCapture,
  onCancel,
  initialType = 'task',
  suggestionsVisible = true,
  suggestions = [],
}: AddModeProps) {
  // State
  const [captureType, setCaptureType] = useState<CaptureType>(initialType);
  const [inputValue, setInputValue] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'voice' | 'camera' | 'image'>('text');
  const [showConnectionPanel, setShowConnectionPanel] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'suggestions'>('history');
  const [history, setHistory] = useState<CaptureItem[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Refs
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  // ============================================================================
  // Effects
  // ============================================================================

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('captureHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }
  }, []);

  // Auto-focus text input on mount
  useEffect(() => {
    if (inputMode === 'text' && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [inputMode]);

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [history.length]);

  // Cleanup: stop camera/voice on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleCapture = () => {
    if (!inputValue.trim() && !capturedImage) return;

    const item: CaptureItem = {
      id: `capture-${Date.now()}`,
      type: captureType,
      content: inputValue,
      timestamp: new Date().toISOString(),
      metadata: capturedImage ? { image: capturedImage } : undefined,
    };

    // Save to history
    const updatedHistory = [...history, item];
    setHistory(updatedHistory);
    localStorage.setItem('captureHistory', JSON.stringify(updatedHistory.slice(-50))); // Keep last 50

    // Callback
    onCapture?.(item);

    // Reset
    setInputValue('');
    setCapturedImage(null);
    setInputMode('text');
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  const handleVoiceCapture = () => {
    setInputMode('voice');
    setIsRecording(true);
    setVoiceTranscript('');

    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      setIsRecording(false);
      setInputMode('text');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');

      setVoiceTranscript(transcript);

      if (event.results[0].isFinal) {
        setInputValue(transcript);
        setIsRecording(false);
        setInputMode('text');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      setInputMode('text');
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (voiceTranscript) {
        setInputMode('text');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceCapture = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setInputMode('text');
  };

  const handleCameraCapture = async () => {
    setInputMode('camera');
    setCameraActive(true);
    setCapturedImage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Unable to access camera. Please check permissions.');
      setCameraActive(false);
      setInputMode('text');
    }
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);

        // Stop camera stream
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        setCameraActive(false);
      }
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
    handleCameraCapture();
  };

  const cancelCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
    setCapturedImage(null);
    setInputMode('text');
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setCapturedImage(imageData);
        setInputMode('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHistoryItemClick = (item: CaptureItem) => {
    setInputValue(item.content);
    setCaptureType(item.type);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const currentTypeConfig = CAPTURE_TYPES[captureType];
  const TypeIcon = currentTypeConfig.icon;

  return (
    <div
      className="h-full flex flex-col"
      style={{
        backgroundColor: semanticColors.bg.primary,
      }}
    >
      {/* Header - Capture Type Selector */}
      <div
        style={{
          padding: spacing[3],
          borderBottom: `1px solid ${semanticColors.border.default}`,
          backgroundColor: semanticColors.bg.secondary,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: spacing[2],
            overflowX: 'auto',
            paddingBottom: spacing[1],
          }}
        >
          {(Object.keys(CAPTURE_TYPES) as CaptureType[]).map((type) => {
            const config = CAPTURE_TYPES[type];
            const Icon = config.icon;
            const isActive = type === captureType;

            return (
              <button
                key={type}
                onClick={() => setCaptureType(type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[1],
                  padding: `${spacing[2]} ${spacing[3]}`,
                  borderRadius: borderRadius.full,
                  backgroundColor: isActive ? config.color : semanticColors.bg.tertiary,
                  color: isActive ? '#fdf6e3' : semanticColors.text.secondary,
                  border: `1px solid ${isActive ? config.color : semanticColors.border.default}`,
                  fontSize: fontSize.xs,
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                <Icon size={iconSize.xs} />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        style={{
          padding: spacing[4],
          paddingBottom: '250px', // Space for connection panel
        }}
      >
        {/* Input Area */}
        <div
          style={{
            marginBottom: spacing[6],
          }}
        >
          {/* Input Mode Switcher */}
          <div
            style={{
              display: 'flex',
              gap: spacing[2],
              marginBottom: spacing[3],
            }}
          >
            <button
              onClick={() => setInputMode('text')}
              style={{
                padding: spacing[2],
                borderRadius: borderRadius.md,
                backgroundColor: inputMode === 'text' ? semanticColors.bg.secondary : semanticColors.bg.primary,
                border: `1px solid ${semanticColors.border.default}`,
                color: semanticColors.text.primary,
                cursor: 'pointer',
              }}
            >
              <Type size={iconSize.base} />
            </button>
            <button
              onClick={handleVoiceCapture}
              style={{
                padding: spacing[2],
                borderRadius: borderRadius.md,
                backgroundColor: inputMode === 'voice' ? semanticColors.accent.error : semanticColors.bg.secondary,
                border: `1px solid ${semanticColors.border.default}`,
                color: inputMode === 'voice' ? '#fdf6e3' : semanticColors.text.primary,
                cursor: 'pointer',
              }}
            >
              <Mic size={iconSize.base} />
            </button>
            <button
              onClick={handleCameraCapture}
              style={{
                padding: spacing[2],
                borderRadius: borderRadius.md,
                backgroundColor: inputMode === 'camera' ? semanticColors.bg.secondary : semanticColors.bg.primary,
                border: `1px solid ${semanticColors.border.default}`,
                color: semanticColors.text.primary,
                cursor: 'pointer',
              }}
            >
              <Camera size={iconSize.base} />
            </button>
            <button
              onClick={handleImageUpload}
              style={{
                padding: spacing[2],
                borderRadius: borderRadius.md,
                backgroundColor: inputMode === 'image' ? semanticColors.bg.secondary : semanticColors.bg.primary,
                border: `1px solid ${semanticColors.border.default}`,
                color: semanticColors.text.primary,
                cursor: 'pointer',
              }}
            >
              <ImageIcon size={iconSize.base} />
            </button>
          </div>

          {/* Text Input */}
          {inputMode === 'text' && (
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: spacing[2],
                  padding: spacing[3],
                  backgroundColor: semanticColors.bg.secondary,
                  borderRadius: borderRadius.lg,
                  border: `2px solid ${currentTypeConfig.color}`,
                }}
              >
                <TypeIcon
                  size={iconSize.lg}
                  style={{
                    color: currentTypeConfig.color,
                    flexShrink: 0,
                    marginTop: spacing[1],
                  }}
                />
                <textarea
                  ref={textInputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleCapture();
                    }
                  }}
                  placeholder={currentTypeConfig.placeholder}
                  rows={3}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    color: semanticColors.text.primary,
                    fontSize: fontSize.base,
                    lineHeight: 1.5,
                  }}
                />
              </div>

              {/* Capture Button */}
              <button
                onClick={handleCapture}
                disabled={!inputValue.trim()}
                style={{
                  position: 'absolute',
                  bottom: spacing[3],
                  right: spacing[3],
                  padding: spacing[2],
                  borderRadius: borderRadius.full,
                  backgroundColor: inputValue.trim() ? currentTypeConfig.color : semanticColors.bg.secondary,
                  color: inputValue.trim() ? '#fdf6e3' : semanticColors.text.muted,
                  border: 'none',
                  cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[1],
                  fontSize: fontSize.sm,
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                <Plus size={iconSize.sm} />
                Add
              </button>
            </div>
          )}

          {/* Voice Recording Indicator */}
          {inputMode === 'voice' && (
            <div
              style={{
                padding: spacing[6],
                backgroundColor: semanticColors.bg.secondary,
                borderRadius: borderRadius.lg,
                border: `2px solid ${semanticColors.accent.error}`,
                textAlign: 'center',
              }}
            >
              <Mic
                size={48}
                style={{
                  color: semanticColors.accent.error,
                  animation: isRecording ? 'pulse 1.5s infinite' : 'none',
                  margin: '0 auto',
                  marginBottom: spacing[3],
                }}
              />
              <p style={{ fontSize: fontSize.base, color: semanticColors.text.primary, fontWeight: 600 }}>
                {isRecording ? 'Listening...' : 'Processing...'}
              </p>
              {voiceTranscript && (
                <p style={{
                  fontSize: fontSize.sm,
                  color: semanticColors.accent.success,
                  marginTop: spacing[3],
                  fontStyle: 'italic',
                }}>
                  "{voiceTranscript}"
                </p>
              )}
              <p style={{ fontSize: fontSize.sm, color: semanticColors.text.secondary, marginTop: spacing[2] }}>
                Speak naturally, I'm capturing your {currentTypeConfig.label.toLowerCase()}
              </p>
              {isRecording && (
                <button
                  onClick={stopVoiceCapture}
                  style={{
                    marginTop: spacing[4],
                    padding: `${spacing[2]} ${spacing[4]}`,
                    backgroundColor: semanticColors.accent.error,
                    color: '#fdf6e3',
                    border: 'none',
                    borderRadius: borderRadius.md,
                    fontSize: fontSize.sm,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Stop Recording
                </button>
              )}
            </div>
          )}

          {/* Camera Interface */}
          {inputMode === 'camera' && (
            <div
              style={{
                backgroundColor: semanticColors.bg.secondary,
                borderRadius: borderRadius.lg,
                border: `2px solid ${currentTypeConfig.color}`,
                overflow: 'hidden',
              }}
            >
              {cameraActive ? (
                <div style={{ position: 'relative' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: spacing[4],
                      display: 'flex',
                      justifyContent: 'center',
                      gap: spacing[3],
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    <button
                      onClick={takePicture}
                      style={{
                        padding: `${spacing[3]} ${spacing[5]}`,
                        backgroundColor: currentTypeConfig.color,
                        color: '#fdf6e3',
                        border: 'none',
                        borderRadius: borderRadius.md,
                        fontSize: fontSize.base,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Take Picture
                    </button>
                    <button
                      onClick={cancelCamera}
                      style={{
                        padding: `${spacing[3]} ${spacing[5]}`,
                        backgroundColor: semanticColors.bg.secondary,
                        color: semanticColors.text.primary,
                        border: `1px solid ${semanticColors.border.default}`,
                        borderRadius: borderRadius.md,
                        fontSize: fontSize.base,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : capturedImage ? (
                <div>
                  <img
                    src={capturedImage}
                    alt="Captured"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                  <div
                    style={{
                      padding: spacing[3],
                      display: 'flex',
                      gap: spacing[2],
                      justifyContent: 'space-between',
                    }}
                  >
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Add a description for this image..."
                      rows={2}
                      style={{
                        flex: 1,
                        padding: spacing[2],
                        backgroundColor: semanticColors.bg.primary,
                        border: `1px solid ${semanticColors.border.default}`,
                        borderRadius: borderRadius.md,
                        color: semanticColors.text.primary,
                        fontSize: fontSize.sm,
                        resize: 'none',
                        outline: 'none',
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                      <button
                        onClick={retakePicture}
                        style={{
                          padding: spacing[2],
                          backgroundColor: semanticColors.bg.secondary,
                          color: semanticColors.text.primary,
                          border: `1px solid ${semanticColors.border.default}`,
                          borderRadius: borderRadius.md,
                          fontSize: fontSize.sm,
                          cursor: 'pointer',
                        }}
                      >
                        Retake
                      </button>
                      <button
                        onClick={() => {
                          handleCapture();
                          setCapturedImage(null);
                          setInputMode('text');
                        }}
                        style={{
                          padding: spacing[2],
                          backgroundColor: currentTypeConfig.color,
                          color: '#fdf6e3',
                          border: 'none',
                          borderRadius: borderRadius.md,
                          fontSize: fontSize.sm,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Image Upload Preview */}
          {inputMode === 'image' && capturedImage && (
            <div
              style={{
                backgroundColor: semanticColors.bg.secondary,
                borderRadius: borderRadius.lg,
                border: `2px solid ${currentTypeConfig.color}`,
                overflow: 'hidden',
              }}
            >
              <img
                src={capturedImage}
                alt="Uploaded"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              <div
                style={{
                  padding: spacing[3],
                  display: 'flex',
                  gap: spacing[2],
                  justifyContent: 'space-between',
                }}
              >
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Add a description for this image..."
                  rows={2}
                  style={{
                    flex: 1,
                    padding: spacing[2],
                    backgroundColor: semanticColors.bg.primary,
                    border: `1px solid ${semanticColors.border.default}`,
                    borderRadius: borderRadius.md,
                    color: semanticColors.text.primary,
                    fontSize: fontSize.sm,
                    resize: 'none',
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                  <button
                    onClick={() => {
                      setCapturedImage(null);
                      setInputMode('text');
                    }}
                    style={{
                      padding: spacing[2],
                      backgroundColor: semanticColors.bg.secondary,
                      color: semanticColors.text.primary,
                      border: `1px solid ${semanticColors.border.default}`,
                      borderRadius: borderRadius.md,
                      fontSize: fontSize.sm,
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => {
                      handleCapture();
                      setCapturedImage(null);
                      setInputMode('text');
                    }}
                    style={{
                      padding: spacing[2],
                      backgroundColor: currentTypeConfig.color,
                      color: '#fdf6e3',
                      border: 'none',
                      borderRadius: borderRadius.md,
                      fontSize: fontSize.sm,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hidden canvas for camera capture */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Connection Panel - History & Suggestions */}
        {showConnectionPanel && (
          <div>
            {/* Tab Switcher */}
            <div
              style={{
                display: 'flex',
                gap: spacing[2],
                marginBottom: spacing[3],
                borderBottom: `1px solid ${semanticColors.border.default}`,
              }}
            >
              <button
                onClick={() => setActiveTab('history')}
                style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === 'history' ? semanticColors.accent.secondary : 'transparent'}`,
                  color: activeTab === 'history' ? semanticColors.text.primary : semanticColors.text.secondary,
                  fontSize: fontSize.sm,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                }}
              >
                <Clock size={iconSize.sm} />
                History
              </button>
              <button
                onClick={() => setActiveTab('suggestions')}
                style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === 'suggestions' ? colors.violet : 'transparent'}`,
                  color: activeTab === 'suggestions' ? semanticColors.text.primary : semanticColors.text.secondary,
                  fontSize: fontSize.sm,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                }}
              >
                <Sparkles size={iconSize.sm} />
                Suggestions
              </button>
            </div>

            {/* History Tab */}
            {activeTab === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                {history.length === 0 ? (
                  <p style={{ fontSize: fontSize.sm, color: semanticColors.text.secondary, textAlign: 'center', padding: spacing[4] }}>
                    No recent captures yet. Start adding {currentTypeConfig.label.toLowerCase()}s above!
                  </p>
                ) : (
                  history.slice(-10).reverse().map((item) => {
                    const typeConfig = CAPTURE_TYPES[item.type];
                    const ItemIcon = typeConfig.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleHistoryItemClick(item)}
                        className="text-left hover:bg-[#002b36] transition-all"
                        style={{
                          padding: spacing[3],
                          backgroundColor: semanticColors.bg.secondary,
                          borderRadius: borderRadius.md,
                          border: `1px solid ${semanticColors.border.default}`,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: spacing[2],
                        }}
                      >
                        <ItemIcon size={iconSize.sm} style={{ color: typeConfig.color, flexShrink: 0, marginTop: spacing[1] }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: fontSize.sm, color: semanticColors.text.primary }}>
                            {item.content}
                          </p>
                          <p style={{ fontSize: fontSize.xs, color: semanticColors.text.muted, marginTop: spacing[1] }}>
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                {currentTypeConfig.examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(example)}
                    className="text-left hover:bg-[#002b36] hover:border-[#6c71c4] transition-all"
                    style={{
                      padding: spacing[3],
                      backgroundColor: semanticColors.bg.secondary,
                      borderRadius: borderRadius.md,
                      border: `1px solid ${semanticColors.border.default}`,
                    }}
                  >
                    <p style={{ fontSize: fontSize.sm, color: semanticColors.text.primary }}>
                      {example}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
