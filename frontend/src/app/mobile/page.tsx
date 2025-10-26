'use client'

import React, { useState, useEffect } from 'react'
import { ArrowUp, MessageCircle, Bot, Camera, Search, Mic, X, Square } from 'lucide-react'
import ErrorBoundary from '@/components/ErrorBoundary'
import SimpleTabs from '@/components/mobile/SimpleTabs'
import type { SimpleTab } from '@/components/mobile/SimpleTabs'
import CaptureMode from '@/components/mobile/modes/CaptureMode'
import ScoutMode from '@/components/mobile/modes/ScoutMode'
import TodayMode from '@/components/mobile/modes/TodayMode'
import ProgressView from '@/components/mobile/ProgressView'
import MenderMode from '@/components/mobile/modes/MenderMode'
import MapperMode from '@/components/mobile/modes/MapperMode'
import Ticker from '@/components/mobile/Ticker'
import {
  spacing,
  semanticColors,
  colors,
  fontSize,
  borderRadius,
  iconSize,
  zIndex,
  shadow,
  coloredShadow,
  animation,
  duration,
} from '@/lib/design-system'
import CaptureLoading from '@/components/mobile/CaptureLoading'
import TaskDropAnimation from '@/components/mobile/TaskDropAnimation'
import MicroStepsBreakdown from '@/components/mobile/MicroStepsBreakdown'
import TaskBreakdownModal from '@/components/mobile/TaskBreakdownModal'
import { QuickCelebration } from '@/components/mobile/RewardCelebration'
import AsyncJobTimeline, { type JobStep } from '@/components/shared/AsyncJobTimeline'
import type { QuickCaptureResponse } from '@/lib/api'
import type { LoadingStage } from '@/types/capture'
import { useVoiceInput } from '@/hooks/useVoiceInput'
// import { useWebSocket } from '@/hooks/useWebSocket'

// MVP: Simplified 3-tab navigation
// 'inbox' = Capture + Scout combined
// 'today' = Today/Hunter view
// 'progress' = Progress tracking (Mender + Mapper combined)
type Mode = SimpleTab | 'search' // Keep search for internal use, map to inbox

// Agent configuration for each mode
const AGENT_CONFIG = {
  inbox: {
    icon: Camera,
    color: colors.cyan,
    name: 'Inbox Agent',
    description: 'Captures tasks instantly with natural language'
  },
  capture: {
    icon: Camera,
    color: colors.cyan,
    name: 'Capture Agent',
    description: 'Captures tasks instantly with natural language'
  },
  search: {
    icon: Search,
    color: colors.yellow,
    name: 'Search Agent',
    description: 'Helps you search and discover tasks'
  }
} as const

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function MobileApp() {
  const [mode, setMode] = useState<Mode>('inbox') // MVP: Start with Inbox tab
  const [energy, setEnergy] = useState(72)
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning')
  const [chat, setChat] = useState('')
  const [autoMode, setAutoMode] = useState(true)
  const [askForClarity, setAskForClarity] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [tickerPaused, setTickerPaused] = useState(false)
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [streakDays, setStreakDays] = useState(0)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [completedCount, setCompletedCount] = useState(0) // Track completed tasks today

  // ADHD UX visual feedback states
  const [loadingStage, setLoadingStage] = useState<LoadingStage | null>(null)
  const [dropAnimationText, setDropAnimationText] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [capturedTask, setCapturedTask] = useState<QuickCaptureResponse | null>(null)
  const [showBreakdown, setShowBreakdown] = useState(false)

  // AsyncJobTimeline state - Capture job
  const [captureSteps, setCaptureSteps] = useState<JobStep[]>([])
  const [captureProgress, setCaptureProgress] = useState(0)
  const [capturingTaskName, setCapturingTaskName] = useState('')
  const [showCaptureJob, setShowCaptureJob] = useState(false)
  const [captureStartTime, setCaptureStartTime] = useState(0)

  // Task preview state
  interface TaskPreview {
    id: string;
    jobName: string;
    steps: JobStep[];
    createdAt: number;
  }
  const [taskPreviews, setTaskPreviews] = useState<TaskPreview[]>([])
  const MAX_PREVIEWS = 3
  const CAPTURE_JOB_DISPLAY_TIME = 5000 // 5 seconds

  // Function to clear all task previews
  const clearTaskPreviews = () => {
    setTaskPreviews([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('taskPreviews')
    }
  }

  // Voice input state
  const [wasVoiceInput, setWasVoiceInput] = useState(false)

  // Suggestions visibility state
  const [suggestionsVisible, setSuggestionsVisible] = useState(true)

  // Suggestion examples pool
  const SUGGESTION_EXAMPLES = [
    "Add milk and eggs to grocery list",
    "Research best noise-canceling headphones",
    "Clean out the fridge before trash day",
    "Reply to that text I've been avoiding",
    "Book a haircut for next week",
    "Download that article to read later",
    "Order new filters for the air purifier",
    "Check if I need to renew my license",
    "Find a recipe for meal prep Sunday",
    "Schedule oil change for the car",
    "Call the dentist to reschedule",
    "Return those shoes that don't fit",
    "Update my resume with recent projects",
    "Backup photos from my phone",
    "Unsubscribe from those spam emails"
  ]

  // Suggestion label ticker messages
  const SUGGESTION_LABELS = [
    "Try these...",
    "Quick captures...",
    "Suggested for you...",
    "Popular tasks..."
  ]

  // Voice input hook
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isVoiceSupported,
    error: voiceError,
  } = useVoiceInput({
    onTranscript: (text) => {
      setChat(text);
      setWasVoiceInput(true);
    },
    onError: async (error) => {
      if (error.type !== 'no-speech' && error.type !== 'aborted') {
        const toast = await import('react-hot-toast');
        toast.default.error(error.message, { duration: 3000 });
      }
    },
  })

  // WebSocket connection for real-time updates (temporarily disabled)
  // const { isConnected } = useWebSocket({
  //   userId: 'mobile-user',
  //   onMessage: (message) => {
  //     console.log('WebSocket message:', message)

  //     // Handle different message types
  //     switch (message.type) {
  //       case 'task_update':
  //         setRefreshTrigger(prev => prev + 1)
  //         break
  //       case 'energy_update':
  //         if (message.data?.current_level !== undefined) {
  //           setEnergy(message.data.current_level)
  //         }
  //         break
  //       case 'progress_update':
  //         if (message.data?.total_xp !== undefined) setXp(message.data.total_xp)
  //         if (message.data?.level !== undefined) setLevel(message.data.level)
  //         if (message.data?.current_streak !== undefined) setStreakDays(message.data.current_streak)
  //         break
  //       case 'notification':
  //         console.log('Notification:', message.data)
  //         break
  //     }
  //   },
  //   onConnect: () => console.log('Connected to WebSocket'),
  //   onDisconnect: () => console.log('Disconnected from WebSocket'),
  //   reconnectInterval: 3000,
  //   maxReconnectAttempts: 5
  // })

  // Fetch initial data on mount
  useEffect(() => {
    updateTimeOfDay();
    fetchProgressData();
    fetchEnergyData();

    // Load task previews from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('taskPreviews')
        if (saved) {
          const parsed = JSON.parse(saved)
          setTaskPreviews(parsed)
        }
      } catch (error) {
        console.warn('Failed to load task previews from localStorage:', error)
      }
    }

    // Set up intervals for real-time updates
    const timeInterval = setInterval(updateTimeOfDay, 60000); // Update time every minute
    const energyInterval = setInterval(fetchEnergyData, 60000); // Update energy every minute

    return () => {
      clearInterval(timeInterval);
      clearInterval(energyInterval);
    };
  }, []);

  // Reset suggestions when switching back to Inbox tab
  useEffect(() => {
    if (mode === 'inbox') {
      setSuggestionsVisible(true);
    }
  }, [mode]);

  // Save task previews to localStorage whenever they change (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('taskPreviews', JSON.stringify(taskPreviews))
      } catch (error) {
        console.warn('Failed to save task previews to localStorage:', error)
      }
    }
  }, [taskPreviews]);

  const fetchProgressData = async () => {
    try {
      const { apiClient } = await import('@/lib/api')
      const stats = await apiClient.getProgressStats('mobile-user')

      // Handle gamification API response structure
      if (stats.active_days_streak !== undefined) {
        setStreakDays(stats.active_days_streak)
      } else if (stats.current_streak !== undefined) {
        setStreakDays(stats.current_streak)
      }

      // Map engagement score to level (1-10 scale)
      if (stats.engagement_score !== undefined) {
        setLevel(Math.floor(stats.engagement_score) || 1)
        // Estimate XP from engagement score
        setXp(Math.floor(stats.engagement_score * 1000) || 0)
      } else {
        setXp(stats.total_xp || 0)
        setLevel(stats.level || 1)
      }
    } catch (error) {
      // Silently fallback to default values - endpoints may not be implemented yet
      console.warn('Progress endpoint not available, using defaults')
    }
  };

  const fetchEnergyData = async () => {
    try {
      const { apiClient } = await import('@/lib/api')
      const energyData = await apiClient.getEnergyLevel('mobile-user')
      // Backend returns energy_level (0-10 scale), convert to percentage with more precision
      const energyLevel = energyData.energy_level || energyData.current_level || 7.2
      // Use Math.round to nearest integer for display, but preserve more granular backend values
      const energyPercentage = Math.round(energyLevel * 10) // Convert 0-10 to 0-100 percentage
      setEnergy(energyPercentage)
      
      // Log for debugging - you'll see more varied values now
      console.log(`Energy updated: ${energyLevel}/10 → ${energyPercentage}%`)
    } catch (error) {
      // Silently fallback to default values - endpoints may not be implemented yet
      console.warn('Energy endpoint not available, using defaults')
    }
  };

  const updateTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      setTimeOfDay('morning');
    } else if (hour >= 12 && hour < 17) {
      setTimeOfDay('afternoon');
    } else if (hour >= 17 && hour < 22) {
      setTimeOfDay('evening');
    } else {
      setTimeOfDay('night');
    }
  };

  const submitChat = async () => {
    if (!chat.trim() || isProcessing) return

    const taskText = chat.trim()
    setIsProcessing(true)
    setShowCaptureJob(true) // Show capture job timeline
    setCaptureStartTime(Date.now()) // Track start time

    try {
      // 1. Show drop animation
      setDropAnimationText(taskText)
      setCapturingTaskName(taskText) // Store for timeline
      setChat('') // Clear input immediately
      setTimeout(() => setDropAnimationText(null), animation.dropAnimation)

      // 2. Initialize capture steps for AsyncJobTimeline
      setCaptureSteps([
        {
          id: 'parse',
          description: 'Parse natural language',
          shortLabel: 'Parsing input',
          detail: 'Extracting task details...',
          estimatedMinutes: 0,
          leafType: 'DIGITAL',
          icon: '🧠',
          status: 'active',
        },
        {
          id: 'llm',
          description: 'LLM decomposition',
          shortLabel: 'Breaking down',
          detail: 'Breaking into micro-steps...',
          estimatedMinutes: 0,
          leafType: 'DIGITAL',
          icon: '🔨',
          status: 'pending',
        },
        {
          id: 'classify',
          description: 'Classify steps',
          shortLabel: 'Classifying steps',
          detail: 'Detecting task types...',
          estimatedMinutes: 0,
          leafType: 'DIGITAL',
          icon: '🏷️',
          status: 'pending',
        },
        {
          id: 'save',
          description: 'Save to database',
          shortLabel: 'Saving task',
          detail: 'Creating task record...',
          estimatedMinutes: 0,
          leafType: 'DIGITAL',
          icon: '💾',
          status: 'pending',
        },
      ])
      setCaptureProgress(0)

      // 2. Start loading with progressive stages
      setLoadingStage('analyzing')

      // Simulate progress updates for AsyncJobTimeline - match actual API timing (~8 seconds)
      const progressInterval = setInterval(() => {
        setCaptureProgress(prev => {
          const newProgress = prev + 0.5 // Very slow increment to match 8-second API call
          if (newProgress >= 100) {
            clearInterval(progressInterval)
            return 100
          }

          // Update step statuses based on progress - realistic timing for 8-second API
          if (newProgress >= 10 && newProgress < 25) {
            setCaptureSteps(steps => steps.map((s, i) =>
              i === 0 ? { ...s, status: 'done' } :
              i === 1 ? { ...s, status: 'active' } : s
            ))
          } else if (newProgress >= 25 && newProgress < 50) {
            setCaptureSteps(steps => steps.map((s, i) =>
              i <= 1 ? { ...s, status: 'done' } :
              i === 2 ? { ...s, status: 'active' } : s
            ))
          } else if (newProgress >= 50 && newProgress < 80) {
            setCaptureSteps(steps => steps.map((s, i) =>
              i <= 2 ? { ...s, status: 'done' } :
              i === 3 ? { ...s, status: 'active' } : s
            ))
          }

          return newProgress
        })
      }, 40) // 40ms interval = 25 updates per second, 0.5% per update = 200 updates total = 8 seconds

      // Progress to 'breaking_down' after 2 seconds
      const stage1Timer = setTimeout(() => {
        setLoadingStage('breaking_down')
      }, animation.loadingStage)

      // Progress to 'almost_done' after 4 seconds
      const stage2Timer = setTimeout(() => {
        setLoadingStage('almost_done')
      }, animation.loadingStage * 2)

      // Import the API client
      const { apiClient } = await import('@/lib/api')

      // Get agent context for inbox and search modes
      const agentMode = mode === 'inbox' ? 'capture' : mode; // Map inbox to capture for API
      const agentContext = (agentMode === 'capture' || agentMode === 'search') && AGENT_CONFIG[agentMode]
        ? { agent_type: agentMode, agent_name: AGENT_CONFIG[agentMode].name }
        : undefined

      const response = await apiClient.quickCapture({
        text: taskText,
        user_id: 'mobile-user',
        voice_input: wasVoiceInput,
        auto_mode: autoMode,
        ask_for_clarity: askForClarity,
        ...agentContext
      })

      // Reset voice input flag after submission
      setWasVoiceInput(false)
      resetTranscript()

      // Clear timers and intervals
      clearTimeout(stage1Timer)
      clearTimeout(stage2Timer)
      clearInterval(progressInterval)

      // Mark all steps as done
      setCaptureSteps(steps => steps.map(s => ({ ...s, status: 'done' as const })))
      setCaptureProgress(100)

      // Clear loading stage
      setLoadingStage(null)

      // 3. Show success feedback
      console.log('Task captured successfully:', response)

      // Store captured task data
      setCapturedTask(response)

      // 4. Create task preview from API response
      if (response.micro_steps && response.micro_steps.length > 0) {
        console.log('Creating task preview with micro_steps:', response.micro_steps)

        console.log('🔍 DEBUG: response.task?.tags:', response.task?.tags);
        console.log('🔍 DEBUG: response.task:', response.task);
        
        
        const taskPreview: TaskPreview = {
          id: `task-${Date.now()}`,
          jobName: response.task?.title || taskText,
          steps: response.micro_steps.map((step: any) => {
            const stepWithTags = {
              id: step.step_id || `step-${Math.random()}`,
              description: step.description || step.name || 'Unknown step',
              shortLabel: step.short_label || step.shortLabel || (step.description || step.name || 'Unknown').slice(0, 15),
              detail: step.detail,
              estimatedMinutes: step.estimated_minutes || 0,
              leafType: step.leaf_type || 'DIGITAL',
              icon: step.icon,
              status: 'done' as const,  // Changed from 'pending' to 'done' - these are completed tasks
              tags: step.tags || [], // Use backend-generated CHAMPS tags

              // Hierarchical fields - CRITICAL for step expansion!
              parentStepId: step.parent_step_id || null,
              level: step.level || 0,
              isLeaf: step.is_leaf !== undefined ? step.is_leaf : true,
              decompositionState: step.decomposition_state || 'atomic',
            };

            // Debug logging for hierarchy fields
            console.log(`🔍 Step "${step.short_label}" hierarchy:`, {
              id: stepWithTags.id,
              isLeaf: stepWithTags.isLeaf,
              decompositionState: stepWithTags.decompositionState,
              estimatedMinutes: stepWithTags.estimatedMinutes,
              rawApiValues: {
                is_leaf: step.is_leaf,
                decomposition_state: step.decomposition_state
              }
            });

            return stepWithTags;
          }),
          createdAt: Date.now(),
        }

        console.log('Adding task preview:', taskPreview)

        // Add to task previews (keep max 3)
        setTaskPreviews(prev => {
          const newPreviews = [taskPreview, ...prev].slice(0, MAX_PREVIEWS)
          console.log('Updated task previews:', newPreviews)
          return newPreviews
        })
      } else {
        console.warn('No micro_steps in response:', response)
      }

      // 5. Hide suggestions after successful capture
      setSuggestionsVisible(false)

      // 6. Show celebration
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), animation.celebration)

      // 7. Display breakdown panel
      setShowBreakdown(true)

      // 7. Hide capture job after 5 seconds
      setTimeout(() => {
        setShowCaptureJob(false)
        setCaptureProgress(0)
        setCaptureSteps([])
        setCapturingTaskName('')
      }, CAPTURE_JOB_DISPLAY_TIME)

      // Update XP if returned
      if (response.xp_earned) {
        setXp(prev => prev + response.xp_earned!)
        console.log('XP earned:', response.xp_earned)
      }

      // Trigger refresh for task lists
      setRefreshTrigger(prev => prev + 1)

    } catch (error) {
      console.error('Error capturing task:', error)

      // Clear loading states
      setLoadingStage(null)

      // Show error toast
      const toast = await import('react-hot-toast')
      toast.default.error(
        error instanceof Error ? error.message : 'Failed to capture task. Please try again.'
      )

      // Restore the chat text so user can retry
      setChat(taskText)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTaskTap = (task: any) => {
    console.log('Task tapped:', task)
    // TODO: Open task detail modal or navigate to task detail page
  }

  const handleSwipeLeft = (task: any) => {
    console.log('Task swiped left:', task)
    // TODO: Mark task as low priority or archive
  }

  const handleSwipeRight = (task: any) => {
    console.log('Task swiped right:', task)
    // TODO: Mark task as complete or high priority
  }

  // Action handlers for breakdown panel
  const handleStartNow = () => {
    console.log('Starting task now')
    setShowBreakdown(false)
    setMode('today') // Switch to Today mode to start working
  }

  const handleViewTasks = () => {
    console.log('Viewing all tasks')
    setShowBreakdown(false)
    setMode('search') // Switch to Search mode to see all tasks
  }

  const handleCaptureAnother = () => {
    console.log('Capturing another task')
    setShowBreakdown(false)
    setCapturedTask(null)
    // Focus on input (browser will auto-focus due to mobile optimization)
  }

  // Handle voice/submit button click
  const handleButtonClick = async () => {
    if (!chat.trim()) {
      // Empty textarea - toggle voice input
      if (isListening) {
        stopListening()
      } else {
        if (!isVoiceSupported) {
          const toast = await import('react-hot-toast');
          toast.default.error('Voice input is not supported in this browser', { duration: 3000 });
          return
        }
        startListening()
      }
    } else {
      // Has text - submit
      submitChat()
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: semanticColors.bg.primary, color: semanticColors.text.primary }}>
      {/* Top bar with capture textarea - only show for non-inbox modes (Today, Progress) */}
      {mode !== 'inbox' && (
      <div style={{ position: 'sticky', top: 0, zIndex: zIndex.sticky, padding: spacing[3] }}>
        <div style={{ position: 'relative' }}>
          <textarea
            value={chat || interimTranscript}
            onChange={(e) => {
              setChat(e.target.value);
              setWasVoiceInput(false); // Reset voice flag when typing manually
            }}
            placeholder=""
            className="w-full resize-none focus:outline-none"
            style={{
              height: spacing[12],
              backgroundColor: semanticColors.bg.secondary,
              color: interimTranscript && !chat ? semanticColors.text.secondary : semanticColors.text.primary,
              borderRadius: borderRadius['2xl'],
              border: `2px solid ${isListening ? colors.magenta : semanticColors.border.accent}`,
              fontSize: fontSize.sm,
              overflow: 'hidden',
              padding: `${spacing[3]} ${spacing[10]} ${spacing[3]} ${spacing[3]}`,
              fontStyle: interimTranscript && !chat ? 'italic' : 'normal'
            }}
            disabled={isProcessing || isListening}
          />
          
          {/* Dynamic Ticker Placeholder */}
          {!chat && !interimTranscript && !isListening && (
            <div
              className="absolute pointer-events-none"
              style={{
                top: '50%',
                left: spacing[3],
                transform: 'translateY(-50%)',
                maxWidth: 'calc(100% - 50px)',
                overflow: 'hidden'
              }}
            >
              <Ticker
                autoMode={autoMode}
                askForClarity={askForClarity}
                isPaused={tickerPaused}
                mode={mode}
                className="text-[#586e75]"
              />
            </div>
          )}

          <button
            onClick={handleButtonClick}
            disabled={isProcessing}
            className="absolute flex items-center justify-center transition-all"
            style={{
              top: spacing[1],
              right: spacing[2],
              width: spacing[8],
              height: spacing[8],
              borderRadius: borderRadius.pill,
              background: chat.trim() && !isProcessing ? semanticColors.accent.primary :
                         isListening ? colors.magenta :
                         semanticColors.bg.secondary,
              color: chat.trim() && !isProcessing ? semanticColors.text.inverse :
                     isListening ? semanticColors.text.inverse :
                     semanticColors.text.secondary,
              border: `1px solid ${isListening ? colors.magenta : semanticColors.text.secondary}`,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              boxShadow: isListening ? coloredShadow(colors.magenta, '30') : 'none'
            }}
          >
            {isProcessing ? (
              <Bot size={iconSize.sm} className="animate-pulse" />
            ) : isListening ? (
              <Square size={iconSize.sm} className="animate-pulse" fill="currentColor" />
            ) : chat.trim() ? (
              <ArrowUp size={iconSize.sm} />
            ) : (
              <Mic size={iconSize.sm} />
            )}
          </button>
        </div>
        {/* Toggle chips */}
        <div style={{ display: 'flex', gap: spacing[1], marginTop: spacing[1] }}>
          {/* Active Agent Indicator for search mode */}
          {mode === 'search' && AGENT_CONFIG.search && (
            <div
              className="flex items-center"
              style={{
                gap: spacing[1],
                padding: `${spacing[1]} ${spacing[2]}`,
                borderRadius: borderRadius.pill,
                backgroundColor: AGENT_CONFIG.search.color,
                color: semanticColors.text.inverse,
                border: `1px solid ${AGENT_CONFIG.search.color}`,
                boxShadow: coloredShadow(AGENT_CONFIG.search.color),
                fontWeight: 'bold'
              }}
            >
              {React.createElement(AGENT_CONFIG.search.icon, { size: iconSize.xs })}
            </div>
          )}
          <label
            className="flex items-center cursor-pointer transition-all active:scale-95"
            style={{
              gap: spacing[1],
              padding: `${spacing[1]} ${spacing[2]}`,
              borderRadius: borderRadius.pill,
              backgroundColor: autoMode ? colors.cyan : `${colors.base02}CC`,
              color: autoMode ? semanticColors.text.inverse : semanticColors.text.secondary,
              border: `1px solid ${autoMode ? colors.cyan : `${colors.base01}80`}`,
              boxShadow: autoMode ? coloredShadow(colors.cyan, '30') : 'none'
            }}
          >
            <input type="checkbox" className="hidden" checked={autoMode} onChange={(e) => {
              setAutoMode(e.target.checked);
              setTickerPaused(true);
              setTimeout(() => setTickerPaused(false), animation.togglePause);
            }} />
            <Bot size={iconSize.xs} />
          </label>
          <label
            className="flex items-center cursor-pointer transition-all active:scale-95"
            style={{
              gap: spacing[1],
              padding: `${spacing[1]} ${spacing[2]}`,
              borderRadius: borderRadius.pill,
              backgroundColor: askForClarity ? colors.blue : `${colors.base02}CC`,
              color: askForClarity ? semanticColors.text.inverse : semanticColors.text.secondary,
              border: `1px solid ${askForClarity ? colors.blue : `${colors.base01}80`}`,
              boxShadow: askForClarity ? coloredShadow(colors.blue, '30') : 'none'
            }}
          >
            <input type="checkbox" className="hidden" checked={askForClarity} onChange={(e) => {
              setAskForClarity(e.target.checked);
              setTickerPaused(true);
              setTimeout(() => setTickerPaused(false), animation.togglePause);
            }} />
            <MessageCircle size={iconSize.xs} />
          </label>
        </div>

        {/* Visual Feedback Components */}
        {/* Capture progress timeline - shows during and briefly after processing */}
        {showCaptureJob && captureSteps.length > 0 && (
          <div style={{
            padding: `${spacing[3]} 0`,
            marginLeft: `-${spacing[3]}`,
            marginRight: `-${spacing[3]}`,
            paddingLeft: spacing[3],
            paddingRight: spacing[3]
          }}>
            <AsyncJobTimeline
              jobName={capturingTaskName || 'Capturing task...'}
              steps={captureSteps}
              currentProgress={captureProgress}
              size="full"
              showProgressBar={false}
            />
          </div>
        )}

        {/* Recently Created Tasks - shows last 3 task previews */}
        {taskPreviews.length > 0 && (
          <div style={{
            padding: `${spacing[3]} 0`,
            marginLeft: `-${spacing[3]}`,
            marginRight: `-${spacing[3]}`,
            paddingLeft: spacing[3],
            paddingRight: spacing[3]
          }}>
            <div style={{
              marginBottom: spacing[2],
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                fontSize: fontSize.xs,
                color: semanticColors.text.secondary,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Recently Created
              </h3>
              <button
                onClick={clearTaskPreviews}
                style={{
                  background: 'none',
                  border: 'none',
                  color: semanticColors.text.secondary,
                  cursor: 'pointer',
                  padding: spacing[1],
                  borderRadius: borderRadius.sm,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
                  e.currentTarget.style.color = semanticColors.text.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = semanticColors.text.secondary
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              {taskPreviews.map((preview) => (
                <AsyncJobTimeline
                  key={preview.id}
                  jobName={preview.jobName}
                  steps={preview.steps}
                  currentProgress={100}
                  size="full"
                  showProgressBar={false}
                  onDismiss={() => {
                    setTaskPreviews(prev => prev.filter(p => p.id !== preview.id))
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Breakdown panel - shows after successful capture */}
        {/* Replaced by TaskBreakdownModal for better UX
        {showBreakdown && capturedTask && (
          <MicroStepsBreakdown
            data={capturedTask}
            onStartNow={handleStartNow}
            onViewTasks={handleViewTasks}
            onCaptureAnother={handleCaptureAnother}
            onClose={() => setShowBreakdown(false)}
          />
        )}
        */}
      </div>
      )}

      {/* Fixed position overlays */}
      {/* Drop animation - brief animation when task is submitted */}
      {dropAnimationText && (
        <TaskDropAnimation text={dropAnimationText} />
      )}

      {/* Celebration - shows after successful capture */}
      {showCelebration && (
        <QuickCelebration />
      )}

      {/* Main content area */}
      <div style={{ height: mode === 'inbox' ? 'calc(100vh - 200px)' : 'calc(100vh - 170px)', overflowY: 'auto' }}>
        {/* Thin progress bar at top - messenger style */}
        {showCaptureJob && captureProgress > 0 && captureProgress < 100 && (
          <div style={{
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            backgroundColor: semanticColors.bg.primary,
            paddingBottom: spacing[2]
          }}>
            <div style={{
              height: '3px',
              backgroundColor: semanticColors.border.accent,
              borderRadius: borderRadius.full,
              overflow: 'hidden'
            }}>
              <div
                style={{
                  height: '100%',
                  width: `${captureProgress}%`,
                  backgroundColor: colors.cyan,
                  transition: 'width 0.3s ease',
                  boxShadow: `0 0 8px ${colors.cyan}`
                }}
              />
            </div>
            <div style={{
              marginTop: spacing[1],
              fontSize: fontSize.xs,
              color: semanticColors.text.secondary,
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              {capturingTaskName || 'Processing...'}
            </div>
          </div>
        )}

        <ErrorBoundary>
          {/* MVP Simplified Modes */}
          {mode === 'inbox' && (
            <CaptureMode
              onTaskCaptured={() => setRefreshTrigger(prev => prev + 1)}
              onExampleClick={(text) => setChat(text)}
              suggestionsVisible={suggestionsVisible}
              suggestionExamples={SUGGESTION_EXAMPLES}
              suggestionLabels={SUGGESTION_LABELS}
            />
          )}
          {mode === 'search' && (
            <ScoutMode
              onTaskTap={handleTaskTap}
              refreshTrigger={refreshTrigger}
            />
          )}
          {mode === 'today' && (
            <TodayMode
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onTaskTap={handleTaskTap}
              refreshTrigger={refreshTrigger}
              energy={energy}
            />
          )}
          {mode === 'progress' && (
            <ProgressView userId="mobile-user" />
          )}
        </ErrorBoundary>
      </div>

      {/* Inbox mode: Simple messaging-app style layout */}
      {mode === 'inbox' && (
        <div style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 60, // Above tabs (smaller tab height now)
          backgroundColor: semanticColors.bg.primary,
          borderTop: `1px solid ${semanticColors.border.default}`,
          zIndex: zIndex.fixed
        }}>
          {/* Toggle chips */}
          <div style={{ padding: `${spacing[2]} ${spacing[3]} ${spacing[1]} ${spacing[3]}`, display: 'flex', gap: spacing[1] }}>
            {/* Active Agent Indicator */}
            <div
              className="flex items-center"
              style={{
                gap: spacing[1],
                padding: `${spacing[1]} ${spacing[2]}`,
                borderRadius: borderRadius.pill,
                backgroundColor: colors.cyan,
                color: semanticColors.text.inverse,
                border: `1px solid ${colors.cyan}`,
                fontSize: fontSize.xs
              }}
            >
              <Camera size={iconSize.xs} />
              <span style={{ fontWeight: '600' }}>Capture</span>
            </div>
            <label
              className="flex items-center cursor-pointer transition-all active:scale-95"
              style={{
                padding: `${spacing[1]} ${spacing[2]}`,
                borderRadius: borderRadius.pill,
                backgroundColor: autoMode ? colors.cyan : semanticColors.bg.secondary,
                color: autoMode ? semanticColors.text.inverse : semanticColors.text.secondary,
                border: `1px solid ${autoMode ? colors.cyan : semanticColors.border.default}`
              }}
            >
              <input type="checkbox" className="hidden" checked={autoMode} onChange={(e) => setAutoMode(e.target.checked)} />
              <Bot size={iconSize.xs} />
            </label>
            <label
              className="flex items-center cursor-pointer transition-all active:scale-95"
              style={{
                padding: `${spacing[1]} ${spacing[2]}`,
                borderRadius: borderRadius.pill,
                backgroundColor: askForClarity ? colors.blue : semanticColors.bg.secondary,
                color: askForClarity ? semanticColors.text.inverse : semanticColors.text.secondary,
                border: `1px solid ${askForClarity ? colors.blue : semanticColors.border.default}`
              }}
            >
              <input type="checkbox" className="hidden" checked={askForClarity} onChange={(e) => setAskForClarity(e.target.checked)} />
              <MessageCircle size={iconSize.xs} />
            </label>
          </div>

          {/* Textarea */}
          <div style={{ padding: `0 ${spacing[3]} ${spacing[2]} ${spacing[3]}`, position: 'relative' }}>
            <textarea
              value={chat || interimTranscript}
              onChange={(e) => {
                setChat(e.target.value);
                setWasVoiceInput(false);
              }}
              placeholder="What's on your mind?"
              className="w-full resize-none focus:outline-none"
              style={{
                height: spacing[16],
                backgroundColor: semanticColors.bg.secondary,
                color: interimTranscript && !chat ? semanticColors.text.secondary : semanticColors.text.primary,
                borderRadius: borderRadius.lg,
                border: `1px solid ${isListening ? colors.magenta : semanticColors.border.accent}`,
                fontSize: fontSize.base,
                padding: `${spacing[3]} ${spacing[12]} ${spacing[3]} ${spacing[3]}`,
                fontStyle: interimTranscript && !chat ? 'italic' : 'normal'
              }}
              disabled={isProcessing || isListening}
            />
            <button
              onClick={handleButtonClick}
              disabled={isProcessing}
              className="absolute flex items-center justify-center transition-all"
              style={{
                bottom: spacing[3],
                right: spacing[4],
                width: spacing[9],
                height: spacing[9],
                borderRadius: borderRadius.full,
                background: chat.trim() && !isProcessing ? colors.cyan :
                           isListening ? colors.magenta :
                           semanticColors.bg.tertiary,
                color: semanticColors.text.inverse,
                border: 'none',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                boxShadow: isListening ? `0 0 12px ${colors.magenta}` : 'none'
              }}
            >
              {isProcessing ? (
                <Bot size={iconSize.sm} className="animate-pulse" />
              ) : isListening ? (
                <Square size={iconSize.sm} className="animate-pulse" fill="currentColor" />
              ) : chat.trim() ? (
                <ArrowUp size={iconSize.sm} />
              ) : (
                <Mic size={iconSize.sm} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Bottom tabs - MVP Simplified */}
      <SimpleTabs
        activeTab={mode === 'search' ? 'inbox' : mode as SimpleTab} // Map search to inbox for display
        onChange={(tab) => setMode(tab)}
        showBadges={{
          inbox: undefined, // Could show unprocessed task count
          today: undefined, // Could show remaining tasks count
          progress: completedCount > 0 // Show indicator if user has completed tasks
        }}
      />

      {/* Task Breakdown Modal - Slide-up modal with TaskCardBig */}
      <TaskBreakdownModal
        captureResponse={capturedTask}
        isOpen={showBreakdown}
        onClose={() => {
          setShowBreakdown(false);
          setCapturedTask(null);
          // Reset capture progress
          setCaptureProgress(0);
          setCaptureSteps([]);
          setCapturingTaskName('');
        }}
        onStartTask={handleStartNow}
        onViewAllTasks={handleViewTasks}
      />
    </div>
  )
}
