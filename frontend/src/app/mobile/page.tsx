'use client'

import React, { useState, useEffect } from 'react'
import { ArrowUp, Zap, MessageCircle, Bot } from 'lucide-react'
import ErrorBoundary from '@/components/ErrorBoundary'
import BiologicalTabs from '@/components/mobile/BiologicalTabs'
import CapturePage from './capture/page'
import ScoutPage from './scout/page'
import HunterPage from './hunter/page'
import MenderPage from './mender/page'
import MapperPage from './mapper/page'
import Ticker from '@/components/mobile/Ticker'
// import { useWebSocket } from '@/hooks/useWebSocket'

type Mode = 'capture' | 'scout' | 'hunter' | 'mender' | 'mapper'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function MobileApp() {
  const [mode, setMode] = useState<Mode>('capture')
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
    const interval = setInterval(updateTimeOfDay, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchProgressData = async () => {
    try {
      const { apiClient } = await import('@/lib/api')
      const stats = await apiClient.getProgressStats('mobile-user')
      setXp(stats.total_xp || 0)
      setLevel(stats.level || 1)
      setStreakDays(stats.current_streak || 0)
    } catch (error) {
      console.error('Error fetching progress:', error)
    }
  };

  const fetchEnergyData = async () => {
    try {
      const { apiClient } = await import('@/lib/api')
      const energyData = await apiClient.getEnergyLevel('mobile-user')
      setEnergy(energyData.current_level || 72)
    } catch (error) {
      console.error('Error fetching energy:', error)
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
    setIsProcessing(true)

    try {
      // Import the API client
      const { apiClient } = await import('@/lib/api')

      const response = await apiClient.quickCapture({
        text: chat,
        user_id: 'mobile-user',
        voice_input: false,
        auto_mode: autoMode,
        ask_for_clarity: askForClarity
      })

      if (response.success) {
        // Clear the chat input
        setChat('')

        // Show success feedback
        console.log('Task captured successfully:', response)

        // Update XP if returned
        if (response.xp_earned) {
          setXp(prev => prev + response.xp_earned!)
          console.log('XP earned:', response.xp_earned)
        }

        // Trigger refresh for task lists
        setRefreshTrigger(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error capturing task:', error)
      // Show error feedback to user (could add toast notification)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#002b36', color: '#93a1a1' }}>
      {/* Top bar with capture textarea */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: 12 }}>
        <div style={{ position: 'relative' }}>
          <textarea
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            placeholder=""
            className="w-full resize-none focus:outline-none"
            style={{
              height: 48,
              backgroundColor: '#073642',
              color: '#93a1a1',
              borderRadius: 24,
              border: '2px solid #2aa198',
              fontSize: 14,
              overflow: 'hidden',
              padding: '12px 40px 12px 12px'
            }}
            disabled={isProcessing}
          />
          
          {/* Dynamic Ticker Placeholder */}
          {!chat && (
            <div 
              className="absolute pointer-events-none"
              style={{
                top: '50%',
                left: 12,
                transform: 'translateY(-50%)',
                maxWidth: 'calc(100% - 50px)',
                overflow: 'hidden'
              }}
            >
              <Ticker 
                autoMode={autoMode} 
                askForClarity={askForClarity}
                isPaused={tickerPaused}
                className="text-[#586e75]"
              />
            </div>
          )}

          <button
            onClick={submitChat}
            disabled={!chat.trim() || isProcessing}
            className="absolute flex items-center justify-center transition-all"
            style={{
              bottom: 13,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: 9999,
              background: chat.trim() && !isProcessing ? '#2aa198' : '#073642',
              color: chat.trim() && !isProcessing ? '#002b36' : '#586e75',
              border: '1px solid #586e75',
              cursor: !chat.trim() || isProcessing ? 'not-allowed' : 'pointer'
            }}
          >
            {isProcessing ? <Zap size={16} className="animate-pulse" /> : <ArrowUp size={16} />}
          </button>
        </div>
        {/* Toggle chips */}
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          <label
            className="flex items-center cursor-pointer transition-all active:scale-95"
            style={{
              gap: 4,
              padding: '4px 8px',
              borderRadius: 9999,
              backgroundColor: autoMode ? '#2aa198' : '#073642CC',
              color: autoMode ? '#002b36' : '#586e75',
              border: `1px solid ${autoMode ? '#2aa198' : '#586e7580'}`,
              boxShadow: autoMode ? '0 2px 8px rgba(42, 161, 152, 0.3)' : 'none'
            }}
          >
            <input type="checkbox" className="hidden" checked={autoMode} onChange={(e) => {
              setAutoMode(e.target.checked);
              setTickerPaused(true);
              setTimeout(() => setTickerPaused(false), 2000); // Pause for 2 seconds
            }} />
            <Bot size={12} />
          </label>
          <label
            className="flex items-center cursor-pointer transition-all active:scale-95"
            style={{
              gap: 4,
              padding: '4px 8px',
              borderRadius: 9999,
              backgroundColor: askForClarity ? '#268bd2' : '#073642CC',
              color: askForClarity ? '#002b36' : '#586e75',
              border: `1px solid ${askForClarity ? '#268bd2' : '#586e7580'}`,
              boxShadow: askForClarity ? '0 2px 8px rgba(38, 139, 210, 0.3)' : 'none'
            }}
          >
            <input type="checkbox" className="hidden" checked={askForClarity} onChange={(e) => {
              setAskForClarity(e.target.checked);
              setTickerPaused(true);
              setTimeout(() => setTickerPaused(false), 2000); // Pause for 2 seconds
            }} />
            <MessageCircle size={12} />
          </label>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ height: 'calc(100vh - 170px)' }}>
        <ErrorBoundary>
          {mode === 'capture' && (
            <CapturePage
              onTaskCaptured={() => setRefreshTrigger(prev => prev + 1)}
              onExampleClick={(text) => setChat(text)}
            />
          )}
          {mode === 'scout' && (
            <ScoutPage
              onTaskTap={(task) => console.log('Task tapped:', task)}
              refreshTrigger={refreshTrigger}
            />
          )}
          {mode === 'hunter' && (
            <HunterPage
              onSwipeLeft={(task) => console.log('Swiped left:', task)}
              onSwipeRight={(task) => console.log('Swiped right:', task)}
              onTaskTap={(task) => console.log('Task tapped:', task)}
              refreshTrigger={refreshTrigger}
            />
          )}
          {mode === 'mender' && (
            <MenderPage
              energy={energy}
              onTaskTap={(task) => console.log('Task tapped:', task)}
              refreshTrigger={refreshTrigger}
            />
          )}
          {mode === 'mapper' && (
            <MapperPage
              xp={xp}
              level={level}
              streakDays={streakDays}
            />
          )}
        </ErrorBoundary>
      </div>

      {/* Bottom tabs */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, padding: '8px 0', zIndex: 20 }}>
        <BiologicalTabs
          activeTab={mode}
          onTabChange={(t) => setMode(t as Mode)}
          energy={energy}
          timeOfDay={timeOfDay}
        />
      </div>
    </div>
  )
}
