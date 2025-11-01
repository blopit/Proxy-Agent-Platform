/**
 * RitualModal - Time-aware ritual modal for morning and evening routines
 *
 * Features:
 * - Time-aware content (morning 6-11am, midday 11am-3pm, evening 6-11pm, night 11pm-6am)
 * - Morning Reset: Energy check-in, intention setting, task preview
 * - Midday Checkpoint: On-track check, energy recheck, quick wins
 * - Evening Closure: Today's celebration, brain dump, tomorrow's intention
 * - Night: Sleep message
 * - Full-screen modal with glassmorphism backdrop
 * - Smooth animations and transitions
 * - ADHD-friendly: Guided prompts, clear actions, dopamine hits
 *
 * Usage:
 * <RitualModal
 *   isOpen={showRitual}
 *   onClose={() => setShowRitual(false)}
 *   onComplete={(data) => saveRitualData(data)}
 * />
 */

'use client';

import React, { useState, useEffect } from 'react';
import TaskCheckbox from '../shared/TaskCheckbox';

// ============================================================================
// Types
// ============================================================================

type TimeOfDay = 'morning' | 'midday' | 'evening' | 'night';

export interface RitualData {
  timeOfDay: TimeOfDay;
  morningEnergy?: number;
  dailyIntention?: string;
  selectedModes?: string[];
  middayEnergy?: number;
  onTrack?: boolean;
  brainDump?: string;
  tomorrowIntention?: string;
  completedAt: string;
}

export interface RitualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: RitualData) => void;
  urgentTasks?: Array<{ title: string }>;
  completedToday?: Array<{ title: string }>;
  todayStats?: { tasks: number; focusMinutes: number; xp: number };
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 15) return 'midday';
  if (hour >= 18 && hour < 23) return 'evening';
  return 'night';
};

// ============================================================================
// Component
// ============================================================================

export default function RitualModal({
  isOpen,
  onClose,
  onComplete,
  urgentTasks = [],
  completedToday = [],
  todayStats = { tasks: 0, focusMinutes: 0, xp: 0 },
  className = '',
}: RitualModalProps) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay());

  // Morning state
  const [morningEnergy, setMorningEnergy] = useState(7);
  const [dailyIntention, setDailyIntention] = useState('');
  const [selectedModes, setSelectedModes] = useState<string[]>([]);

  // Midday state
  const [middayEnergy, setMiddayEnergy] = useState(5);
  const [onTrack, setOnTrack] = useState<boolean | null>(null);

  // Evening state
  const [brainDump, setBrainDump] = useState('');
  const [tomorrowIntention, setTomorrowIntention] = useState('');

  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
  }, [isOpen]);

  const toggleMode = (mode: string) => {
    setSelectedModes(prev =>
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    );
  };

  const handleComplete = () => {
    const data: RitualData = {
      timeOfDay,
      completedAt: new Date().toISOString(),
    };

    if (timeOfDay === 'morning') {
      data.morningEnergy = morningEnergy;
      data.dailyIntention = dailyIntention;
      data.selectedModes = selectedModes;
    } else if (timeOfDay === 'midday') {
      data.middayEnergy = middayEnergy;
      data.onTrack = onTrack ?? undefined;
    } else if (timeOfDay === 'evening') {
      data.brainDump = brainDump;
      data.tomorrowIntention = tomorrowIntention;
    }

    onComplete?.(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`ritual-modal-overlay ${className}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="ritual-modal-content"
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          backgroundColor: '#002b36',
          borderRadius: '16px',
          border: '2px solid #073642',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #073642',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#93a1a1', margin: 0 }}>
            {timeOfDay === 'morning' && '🌅 Morning Reset'}
            {timeOfDay === 'midday' && '☀️ Midday Checkpoint'}
            {timeOfDay === 'evening' && '🌙 Evening Closure'}
            {timeOfDay === 'night' && '😴 Rest Well'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#586e75',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0 8px',
            }}
          >
            ×
          </button>
        </div>

        {/* Content - Scrollable */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
          }}
        >
          {/* MORNING RESET */}
          {timeOfDay === 'morning' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Energy Check-in */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#073642',
                  borderRadius: '12px',
                  border: '2px solid #cb4b16',
                }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#93a1a1', marginBottom: '12px' }}>
                  ⚡ Energy Check-in
                </h3>
                <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '12px' }}>
                  How's your energy right now?
                </p>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={morningEnergy}
                  onChange={(e) => setMorningEnergy(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#002b36',
                    borderRadius: '4px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#586e75',
                    marginTop: '8px',
                  }}
                >
                  <span>Low (0)</span>
                  <span style={{ fontWeight: 'bold', color: '#93a1a1' }}>{morningEnergy}/10</span>
                  <span>High (10)</span>
                </div>
              </div>

              {/* Daily Intention */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#073642',
                  borderRadius: '12px',
                  border: '2px solid #268bd2',
                }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#93a1a1', marginBottom: '12px' }}>
                  🎯 Today's Intention
                </h3>
                <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '12px' }}>
                  What's ONE thing you want to accomplish today?
                </p>
                <input
                  type="text"
                  value={dailyIntention}
                  onChange={(e) => setDailyIntention(e.target.value)}
                  placeholder="My main focus today is..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#002b36',
                    color: '#93a1a1',
                    border: '1px solid #586e75',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Urgent Tasks Preview */}
              {urgentTasks.length > 0 && (
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#073642',
                    borderRadius: '12px',
                    border: '2px solid #859900',
                  }}
                >
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#93a1a1', marginBottom: '12px' }}>
                    📋 What's Calling for Attention
                  </h3>
                  <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '12px' }}>
                    {urgentTasks.length} tasks that need you today:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {urgentTasks.slice(0, 3).map((task, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '8px',
                          backgroundColor: '#002b36',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#93a1a1',
                        }}
                      >
                        • {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode Selection */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#073642',
                  borderRadius: '12px',
                  border: '2px solid #6c71c4',
                }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#93a1a1', marginBottom: '12px' }}>
                  🎨 Set Your Mode
                </h3>
                <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '12px' }}>
                  How do you want to approach today?
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['🎯 Focused', '💬 Social', '🎨 Creative', '🔋 Low Energy'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => toggleMode(mode)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        border: '1px solid',
                        backgroundColor: selectedModes.includes(mode) ? '#268bd2' : '#002b36',
                        color: selectedModes.includes(mode) ? '#fdf6e3' : '#93a1a1',
                        borderColor: selectedModes.includes(mode) ? '#268bd2' : '#586e75',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MIDDAY CHECKPOINT */}
          {timeOfDay === 'midday' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* On Track Check */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#073642',
                  borderRadius: '12px',
                  border: '2px solid #b58900',
                }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#93a1a1', marginBottom: '12px' }}>
                  📍 How's it going?
                </h3>
                <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '12px' }}>
                  Still on track with your intention?
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setOnTrack(true)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: onTrack === true ? '#859900' : '#002b36',
                      color: onTrack === true ? '#fdf6e3' : '#859900',
                      transform: onTrack === true ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    👍 On Track
                  </button>
                  <button
                    onClick={() => setOnTrack(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: onTrack === false ? '#dc322f' : '#002b36',
                      color: onTrack === false ? '#fdf6e3' : '#dc322f',
                      transform: onTrack === false ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    👎 Need Adjust
                  </button>
                </div>
              </div>

              {/* Energy Recheck */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#073642',
                  borderRadius: '12px',
                  border: '2px solid #268bd2',
                }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#93a1a1', marginBottom: '12px' }}>
                  ⚡ Energy Level
                </h3>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={middayEnergy}
                  onChange={(e) => setMiddayEnergy(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#002b36',
                    borderRadius: '4px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ textAlign: 'center', fontSize: '12px', color: '#93a1a1', fontWeight: 'bold', marginTop: '8px' }}>
                  {middayEnergy}/10
                </div>
              </div>
            </div>
          )}

          {/* EVENING CLOSURE */}
          {timeOfDay === 'evening' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Today's Celebration */}
              <div
                style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, rgba(133, 153, 0, 0.2), rgba(38, 139, 210, 0.2))',
                  borderRadius: '12px',
                  border: '2px solid #859900',
                }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#93a1a1', marginBottom: '12px' }}>
                  🎉 You Completed Today
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#859900' }}>{todayStats.tasks}</div>
                    <div style={{ fontSize: '11px', color: '#586e75' }}>Tasks</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#268bd2' }}>{todayStats.focusMinutes}m</div>
                    <div style={{ fontSize: '11px', color: '#586e75' }}>Focus Time</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#b58900' }}>{todayStats.xp}</div>
                    <div style={{ fontSize: '11px', color: '#586e75' }}>XP</div>
                  </div>
                </div>
                {completedToday.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {completedToday.slice(0, 5).map((task, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '8px',
                          backgroundColor: '#002b36',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#93a1a1',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span>✅</span> {task.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Brain Dump */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#073642',
                  borderRadius: '12px',
                  border: '2px solid #6c71c4',
                }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#93a1a1', marginBottom: '12px' }}>
                  🧠 Brain Dump
                </h3>
                <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '12px' }}>
                  What's still on your mind?
                </p>
                <textarea
                  value={brainDump}
                  onChange={(e) => setBrainDump(e.target.value)}
                  placeholder="Get it out of your head..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#002b36',
                    color: '#93a1a1',
                    border: '1px solid #586e75',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              {/* Tomorrow's Intention */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#073642',
                  borderRadius: '12px',
                  border: '2px solid #268bd2',
                }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#93a1a1', marginBottom: '12px' }}>
                  🌅 Tomorrow's Intention
                </h3>
                <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '12px' }}>
                  What's ONE thing for tomorrow?
                </p>
                <input
                  type="text"
                  value={tomorrowIntention}
                  onChange={(e) => setTomorrowIntention(e.target.value)}
                  placeholder="Tomorrow I will..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#002b36',
                    color: '#93a1a1',
                    border: '1px solid #586e75',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          {/* NIGHT MESSAGE */}
          {timeOfDay === 'night' && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>😴</div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#93a1a1', marginBottom: '8px' }}>
                Rest Well
              </h2>
              <p style={{ fontSize: '13px', color: '#586e75', marginBottom: '16px' }}>
                Rituals are available in the morning (6am-11am) and evening (6pm-11pm)
              </p>
              <p style={{ fontSize: '11px', color: '#586e75' }}>
                Current time: {new Date().toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        {/* Footer - Action Button */}
        {timeOfDay !== 'night' && (
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid #073642',
            }}
          >
            <button
              onClick={handleComplete}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                background:
                  timeOfDay === 'morning'
                    ? 'linear-gradient(90deg, #cb4b16, #dc322f)'
                    : timeOfDay === 'midday'
                    ? 'linear-gradient(90deg, #b58900, #cb4b16)'
                    : 'linear-gradient(90deg, #6c71c4, #d33682)',
                color: '#fdf6e3',
                transition: 'all 0.2s ease',
              }}
            >
              {timeOfDay === 'morning' && '✨ Start My Day'}
              {timeOfDay === 'midday' && '⚡ Continue'}
              {timeOfDay === 'evening' && '🌙 Close My Day'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
