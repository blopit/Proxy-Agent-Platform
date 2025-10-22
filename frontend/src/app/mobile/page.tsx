'use client'

import React, { useState, useEffect, useRef } from "react";
import './mobile.css';
import RewardCelebration, { QuickCelebration, MysteryBoxCelebration } from '../../components/mobile/RewardCelebration';
import SwipeableTaskCard from '../../components/mobile/SwipeableTaskCard';
import SwipeableModeHeader from '../../components/mobile/SwipeableModeHeader';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Tailwind-only ADHD Mission Control - integrated with real backend APIs

interface Task {
  task_id?: string;
  id?: number;
  title: string;
  description?: string;
  desc?: string;
  status: string;
  priority: string;
  context?: string;
  tone?: string;
  done?: boolean;
  created_at?: string;
  estimated_hours?: number;
  tags?: string[];
  is_digital?: boolean;
}

// ADHD Task Management System with Biological Circuits

interface PillProps {
  text: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}

interface ChipProps {
  children: React.ReactNode;
}

const Pill = ({ text, tone = "neutral" }: PillProps) => {
  const tones = {
    neutral: "bg-[#073642] text-[#93a1a1] border border-[#586e75]",
    good: "bg-[#073642] text-[#859900] border border-[#859900]",
    warn: "bg-[#073642] text-[#b58900] border border-[#b58900]",
    bad: "bg-[#073642] text-[#dc322f] border border-[#dc322f]",
  };
  return <span className={`px-2 py-1 rounded-full text-xs ${tones[tone]}`}>{text}</span>;
};

const Chip = ({ children }: ChipProps) => (
  <span className="px-2 py-0.5 rounded-full text-xs border border-gray-300 bg-gray-100 text-gray-700 mr-1 mb-1 inline-flex items-center gap-1">
    {children}
  </span>
);

interface TaskRowProps {
  t: Task;
  onToggle: () => void;
  onSlice: () => void;
  onDelegate: () => void;
}

const TaskRow = ({ t, onToggle, onSlice, onDelegate }: TaskRowProps) => {
  const isDone = t.done ?? (t.status === 'completed');
  return (
    <div className="py-3 border-b border-[#586e75] last:border-b-0">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isDone}
          onChange={onToggle}
          className="mt-1 h-5 w-5 rounded border-[#586e75] focus:ring-2 focus:ring-[#268bd2] bg-[#073642]"
        />
        <div className={`flex-1 ${isDone ? "line-through text-[#586e75]" : "text-[#93a1a1]"}`}>
          <div className="text-sm font-medium leading-tight">{t.title}</div>
          {(t.desc || t.description) && <div className="text-xs text-[#586e75] mt-1">{t.desc || t.description}</div>}
        </div>
        <Pill text={t.context || t.priority || "medium"} tone={(t.tone as "neutral" | "good" | "warn" | "bad") || "neutral"} />
      </label>
      <div className="ml-8 mt-3 flex flex-wrap gap-2">
        <button
          onClick={onSlice}
          className="px-3 py-2 rounded-lg border border-[#586e75] text-xs bg-[#073642] text-[#93a1a1] hover:bg-[#002b36] active:bg-[#002b36] transition-colors touch-manipulation"
        >
          Slice → 2–5m
        </button>
        <button
          onClick={onDelegate}
          className="px-3 py-2 rounded-lg bg-[#268bd2] text-[#fdf6e3] text-xs hover:bg-[#2aa198] active:bg-[#859900] transition-colors touch-manipulation"
        >
          Delegate → Agent
        </button>
      </div>
    </div>
  );
};

interface PomodoroProps {
  onStart: (duration: number) => void;
}

const Pomodoro = ({ onStart }: PomodoroProps) => {
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecs((s) => {
      if (s <= 1) {
        setRunning(false);
        return 25 * 60;
      }
      return s - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [running]);

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  const handleStart = () => {
    setRunning(!running);
    if (!running && onStart) {
      onStart(25);
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="text-2xl sm:text-3xl font-semibold tabular-nums text-[#93a1a1]">{mm}:{ss}</div>
      <button
        onClick={handleStart}
        className="px-3 py-2 rounded-lg bg-[#268bd2] text-[#fdf6e3] text-sm hover:bg-[#2aa198] active:bg-[#859900] transition-colors touch-manipulation"
      >
        {running ? "Pause" : "Start"}
      </button>
      <button
        onClick={() => { setSecs(25 * 60); setRunning(false); }}
        className="px-3 py-2 rounded-lg border border-[#586e75] text-sm bg-[#073642] text-[#93a1a1] hover:bg-[#002b36] active:bg-[#002b36] transition-colors touch-manipulation"
      >
        Reset
      </button>
    </div>
  );
};

interface AgentStatusProps {
  name: string;
  status: string;
  tags?: string[];
}

const AgentStatus = ({ name, status, tags = [] }: AgentStatusProps) => (
  <div className="bg-[#002b36] rounded-xl p-3 border border-[#586e75] flex items-center justify-between">
    <div>
      <div className="font-medium text-[#93a1a1]">{name}</div>
      <div className="text-xs text-[#586e75]">{status}</div>
    </div>
    <div className="flex flex-wrap gap-1">
      {tags.map((t, i) => (
        <Chip key={i}>{t}</Chip>
      ))}
    </div>
  </div>
);

interface TimelineItemProps {
  time: string;
  title: string;
  meta: string;
}

const TimelineItem = ({ time, title, meta }: TimelineItemProps) => (
  <div className="flex gap-3 items-start">
    <div className="w-16 text-xs text-[#586e75] pt-1">{time}</div>
    <div className="relative pl-4">
      <div className="absolute left-0 top-2 w-2 h-2 bg-[#268bd2] rounded-full" />
      <div className="font-medium text-[#93a1a1] text-sm">{title}</div>
      <div className="text-xs text-[#586e75]">{meta}</div>
    </div>
  </div>
);

interface AnalysisPreviewProps {
  analysis: {
    category?: string;
    confidence?: number;
    should_delegate?: boolean;
    reasoning?: string;
  };
  onClose: () => void;
}

const AnalysisPreview = ({ analysis, onClose }: AnalysisPreviewProps) => {
  const confidencePercent = Math.round((analysis.confidence || 0) * 100);
  const confidenceColor = confidencePercent >= 80 ? 'text-[#859900]' : confidencePercent >= 50 ? 'text-[#b58900]' : 'text-[#586e75]';

  return (
    <div className="bg-gradient-to-r from-[#073642] to-[#002b36] rounded-xl p-4 border border-[#268bd2] mb-3">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-[#93a1a1] text-sm">AI Analysis</h4>
        <button onClick={onClose} className="text-[#586e75] hover:text-[#93a1a1]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-2 text-sm">
        {analysis.category && (
          <div className="flex items-center gap-2">
            <span className="text-[#586e75]">Category:</span>
            <Pill text={analysis.category} tone="neutral" />
          </div>
        )}

        {analysis.confidence !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-[#586e75]">Confidence:</span>
            <span className={`font-semibold ${confidenceColor}`}>{confidencePercent}%</span>
          </div>
        )}

        {analysis.should_delegate && (
          <div className="flex items-center gap-2">
            <span className="text-[#b58900] font-medium">⚡ Delegation suggested</span>
          </div>
        )}

        {analysis.reasoning && (
          <div className="text-[#93a1a1] text-xs mt-2 p-2 bg-[#002b36]/60 rounded border border-[#586e75]">
            {analysis.reasoning}
          </div>
        )}
      </div>
    </div>
  );
};

interface ClarityFormProps {
  questions: Array<{
    question: string;
    type: 'boolean' | 'select' | 'date' | 'text';
    options?: string[];
  }>;
  onSubmit: (answers: Record<string, any>) => void;
  onCancel: () => void;
}

const ClarityForm = ({ questions, onSubmit, onCancel }: ClarityFormProps) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const handleSubmit = () => {
    onSubmit(answers);
  };

  return (
    <div className="bg-[#073642] rounded-xl p-4 border border-[#268bd2] mb-3">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-[#93a1a1]">A few quick questions...</h4>
        <button onClick={onCancel} className="text-[#586e75] hover:text-[#93a1a1]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div key={idx} className="bg-[#002b36] rounded-lg p-3 border border-[#586e75]">
            <label className="block text-sm font-medium text-[#93a1a1] mb-2">
              {q.question}
            </label>

            {q.type === 'boolean' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setAnswers({ ...answers, [idx]: true })}
                  className={`flex-1 px-3 py-2 rounded text-sm ${
                    answers[idx] === true ? 'bg-[#859900] text-[#fdf6e3]' : 'bg-[#073642] text-[#93a1a1] border border-[#586e75]'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setAnswers({ ...answers, [idx]: false })}
                  className={`flex-1 px-3 py-2 rounded text-sm ${
                    answers[idx] === false ? 'bg-[#dc322f] text-[#fdf6e3]' : 'bg-[#073642] text-[#93a1a1] border border-[#586e75]'
                  }`}
                >
                  No
                </button>
              </div>
            )}

            {q.type === 'select' && q.options && (
              <select
                value={answers[idx] || ''}
                onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                className="w-full px-3 py-2 rounded border border-[#586e75] text-sm bg-[#002b36] text-[#93a1a1]"
              >
                <option value="">Select...</option>
                {q.options.map((opt, optIdx) => (
                  <option key={optIdx} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {q.type === 'date' && (
              <input
                type="date"
                value={answers[idx] || ''}
                onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                className="w-full px-3 py-2 rounded border border-[#586e75] text-sm bg-[#002b36] text-[#93a1a1]"
              />
            )}

            {q.type === 'text' && (
              <input
                type="text"
                value={answers[idx] || ''}
                onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                placeholder="Type your answer..."
                className="w-full px-3 py-2 rounded border border-[#586e75] text-sm bg-[#002b36] text-[#93a1a1] placeholder-[#586e75]"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 rounded-lg bg-[#268bd2] text-[#fdf6e3] text-sm hover:bg-[#2aa198]"
        >
          Create Task
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-[#586e75] text-sm bg-[#073642] text-[#93a1a1] hover:bg-[#002b36]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

interface QuickCaptureProps {
  onAdd: (task: { title: string; desc: string }) => void;
  isLoading: boolean;
}

const QuickCapture = ({ onAdd, isLoading }: QuickCaptureProps) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd({ title, desc });
    setTitle("");
    setDesc("");
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && e.metaKey && handleAdd()}
        placeholder="Quick capture (⌘⏎ to add)"
        className="w-full rounded-xl border border-[#586e75] px-3 py-3 text-sm bg-[#002b36] text-[#93a1a1] placeholder-[#586e75] focus:ring-2 focus:ring-[#268bd2] focus:border-[#268bd2]"
        disabled={isLoading}
      />
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Optional description"
        className="w-full rounded-xl border border-[#586e75] px-3 py-3 text-sm bg-[#002b36] text-[#93a1a1] placeholder-[#586e75] focus:ring-2 focus:ring-[#268bd2] focus:border-[#268bd2] resize-none"
        rows={2}
        disabled={isLoading}
      />
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-lg bg-[#268bd2] text-[#fdf6e3] text-sm disabled:opacity-50 hover:bg-[#2aa198] active:bg-[#859900] transition-colors touch-manipulation"
        >
          {isLoading ? 'Adding...' : 'Add Task'}
        </button>
        <button
          onClick={() => { setTitle(""); setDesc(""); }}
          className="px-4 py-3 rounded-lg border border-[#586e75] text-sm bg-[#073642] text-[#93a1a1] hover:bg-[#002b36] active:bg-[#002b36] transition-colors touch-manipulation"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default function ADHDTaskManager() {
  // Core state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [biologicalMode, setBiologicalMode] = useState('scout');
  const [energy, setEnergy] = useState(72);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Gamification state
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streakDays, setStreakDays] = useState(0);

  // Celebration state
  const [celebration, setCelebration] = useState<any>(null);
  const [quickCelebrationMsg, setQuickCelebrationMsg] = useState<string | null>(null);
  const [mysteryBox, setMysteryBox] = useState<any>(null);

  // Additional state for ADHD features
  const [sessionMultiplier, setSessionMultiplier] = useState(0);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [delegations, setDelegations] = useState<any[]>([]);

  // Legacy state for compatibility (will be removed)
  const [isScrolled, setIsScrolled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [askForClarity, setAskForClarity] = useState(false);
  const [quickCaptureText, setQuickCaptureText] = useState("");
  const [microStep, setMicroStep] = useState("");
  const [bodyDouble, setBodyDouble] = useState(false);
  const [currentSection, setCurrentSection] = useState('tasks');
  const [adhdMode, setAdhdMode] = useState(true);
  const expandedOptionsRef = useRef<HTMLDivElement>(null);

  // Task analysis state
  const [showAnalysisPreview, setShowAnalysisPreview] = useState(false);
  const [taskAnalysis, setTaskAnalysis] = useState<any>(null);
  const [showClarityForm, setShowClarityForm] = useState(false);
  const [clarityQuestions, setClarityQuestions] = useState<any[]>([]);

  useEffect(() => {
    fetchTasks();
    fetchGameStats();
    fetchEnergy();
    fetchDelegations();
    fetchTimeline();
  }, []);

  // Simplified scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const nowScrolled = scrollTop > 50;

      if (nowScrolled !== isScrolled) {
        setIsScrolled(nowScrolled);
        if (nowScrolled) {
          setIsExpanded(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  // ✅ CONNECTED: WebSocket for real-time updates
  useEffect(() => {
    const wsUrl = API_URL.replace(/^http/, 'ws');
    const ws = new WebSocket(`${wsUrl}/ws/mobile-user`);

    ws.onopen = () => {
      console.log('✅ WebSocket connected for real-time updates');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'task_created' || data.type === 'task_updated') {
          fetchTasks(); // Refresh task list
        } else if (data.type === 'xp_earned') {
          setXp(data.new_xp || data.xp || 0);
          setQuickCelebrationMsg(`+${data.xp || 0} XP!`);
        } else if (data.type === 'achievement_unlocked') {
          setQuickCelebrationMsg(`🏆 ${data.achievement_name || 'Achievement Unlocked'}!`);
        } else if (data.type === 'level_up') {
          setLevel(data.new_level || 1);
          setQuickCelebrationMsg(`🎉 LEVEL UP! Now Level ${data.new_level}`);
        } else if (data.type === 'streak_updated') {
          setStreakDays(data.new_streak || 0);
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };

    ws.onerror = (error) => {
      console.warn('WebSocket error (non-critical):', error);
    };

    ws.onclose = () => {
      console.log('❌ WebSocket disconnected');
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const fetchTasks = async () => {
    try {
      // ✅ CONNECTED: Real comprehensive tasks API with filters
      const response = await fetch(`${API_URL}/api/v1/tasks?limit=50&user_id=mobile-user`);
      if (!response.ok) {
        console.warn('Tasks API not available, trying simple-tasks fallback');
        // Fallback to simple-tasks endpoint
        const fallbackResponse = await fetch(`${API_URL}/api/v1/simple-tasks`);
        if (!fallbackResponse.ok) throw new Error('Both tasks endpoints failed');
        const fallbackData = await fallbackResponse.json();
        setTasks(fallbackData.tasks || []);
        return;
      }
      const data = await response.json();
      setTasks(data.tasks || data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setTasks([]); // Clear tasks on error
    }
  };

  const fetchGameStats = async () => {
    try {
      // ✅ CONNECTED: Real Progress API call
      const progressRes = await fetch(`${API_URL}/api/v1/progress/level-progression?user_id=mobile-user`);
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setXp(progressData.current_xp || 0);
        setLevel(progressData.current_level || 1);
      } else {
        console.warn('Progress API not available, using fallback');
        // Fallback to calculating from tasks
        const completedCount = tasks.filter(t => t.status === 'completed').length;
        setXp(completedCount * 25);
        setLevel(Math.floor(completedCount / 4) + 1);
      }

      // ✅ CONNECTED: Real Gamification API call for streaks
      const gamificationRes = await fetch(`${API_URL}/api/v1/gamification/user-stats?user_id=mobile-user`);
      if (gamificationRes.ok) {
        const gamificationData = await gamificationRes.json();
        setStreakDays(gamificationData.current_streak || 0);
        if (gamificationData.session_multiplier) {
          setSessionMultiplier(gamificationData.session_multiplier);
        }
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
      // Fallback values
      setXp(0);
      setLevel(1);
    }
  };

  const fetchEnergy = async () => {
    try {
      // ✅ CONNECTED: Real Energy API call
      const response = await fetch(`${API_URL}/api/v1/energy/current-level?user_id=mobile-user`);
      if (!response.ok) {
        console.warn('Energy API not available, using fallback');
        setEnergy(72); // Fallback to 72%
        return;
      }
      const data = await response.json();
      // Convert 0-10 scale to 0-100 percentage
      const energyPercent = Math.round((data.energy_level || 7.2) * 10);
      setEnergy(energyPercent);

      // 🤖 Epic 2.2: Get AI energy predictions and recommendations
      try {
        const trackResponse = await fetch(`${API_URL}/api/v1/energy/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: `Current energy level: ${energyPercent}%` })
        });

        if (trackResponse.ok) {
          const trackData = await trackResponse.json();
          console.log('🤖 AI Energy Analysis:');
          console.log('  Trend:', trackData.trend);
          console.log('  Predicted next hour:', trackData.predicted_next_hour);
          console.log('  Confidence:', (trackData.confidence * 100).toFixed(0) + '%');
          console.log('  💡 Recommendations:', trackData.immediate_recommendations);
        }
      } catch (err) {
        console.log('AI Energy tracking not available');
      }
    } catch (err) {
      console.error('Energy fetch error:', err);
      setEnergy(72); // Fallback to 72% on error
    }
  };

  const fetchDelegations = async () => {
    try {
      // ✅ CONNECTED: Real Secretary API for delegations
      const response = await fetch(`${API_URL}/api/v1/secretary/delegations?user_id=mobile-user`);
      if (!response.ok) {
        console.warn('Delegations API not available, using empty list');
        setDelegations([]);
        return;
      }
      const data = await response.json();
      setDelegations(data.delegations || []);
    } catch (err) {
      console.error('Delegations fetch error:', err);
      setDelegations([]);
    }
  };

  const fetchTimeline = async () => {
    try {
      // ✅ CONNECTED: Real Secretary API for timeline
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_URL}/api/v1/secretary/timeline?user_id=mobile-user&date=${today}`);
      if (!response.ok) {
        console.warn('Timeline API not available, using empty list');
        setTimelineEvents([]);
        return;
      }
      const data = await response.json();
      setTimelineEvents(data.events || []);
    } catch (err) {
      console.error('Timeline fetch error:', err);
      setTimelineEvents([]);
    }
  };

  const addTask = async ({ title, desc }: { title: string; desc: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/mobile/quick-capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: title,
          user_id: 'mobile-user',
          voice_input: false,
          auto_mode: autoMode,
          ask_for_clarity: askForClarity
        })
      });

      if (!response.ok) throw new Error('Failed to create task');

      const result = await response.json();

      // Handle clarity mode response
      if (result.needs_clarification) {
        setClarityQuestions(result.questions);
        setShowClarityForm(true);
        return;
      }

      // Handle auto mode response with analysis
      if (result.analysis) {
        setTaskAnalysis(result.analysis);
        setShowAnalysisPreview(true);
      }

      setTasks([result.task, ...tasks]);
      setXp(prev => prev + 0);
    } catch (err) {
      console.error('Add task error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    const taskId = task.task_id || task.id;

    try {
      const response = await fetch(`${API_URL}/api/v1/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update');

      setTasks(tasks.map(t =>
        (t.task_id || t.id) === taskId ? { ...t, status: newStatus, done: newStatus === 'completed' } : t
      ));

      // Dopamine engineering: Claim reward after completion
      if (newStatus === 'completed') {
        await claimReward(String(taskId), task.priority || 'medium');
      } else {
        // Quick celebration for unchecking
        setQuickCelebrationMsg("Marked as todo");
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  // Claim reward with celebration (HABIT.md dopamine system)
  const claimReward = async (taskId: string, priority: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/rewards/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'mobile-user',
          task_id: taskId,
          action_type: 'task',
          task_priority: priority,
          streak_days: streakDays,
          power_hour_active: false,
          energy_level: energy
        })
      });

      if (!response.ok) throw new Error('Failed to claim reward');

      const reward = await response.json();

      // 🤖 Epic 2.3: Get AI-powered celebration message
      try {
        const completedCount = tasks.filter(t => t.status === 'completed').length + 1;
        const gamificationResponse = await fetch(`${API_URL}/api/v1/gamification/achievements`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tasks_completed_today: completedCount,
            consecutive_days: streakDays,
            total_xp: xp + (reward.total_xp || 0),
            focus_sessions_completed: 5,
            average_task_quality: 0.85
          })
        });

        if (gamificationResponse.ok) {
          const achievements = await gamificationResponse.json();
          if (achievements.triggered_achievements?.length > 0) {
            achievements.triggered_achievements.forEach((ach: any) => {
              console.log('🎉 AI Celebration:', ach.celebration_message);
              setQuickCelebrationMsg(ach.celebration_message || `+${reward.total_xp} XP!`);
            });
          }
        }
      } catch (err) {
        console.log('AI Gamification not available, using standard celebration');
      }

      // Update XP and level
      setXp(reward.new_total_xp || reward.total_xp || 0);
      setLevel(reward.new_level || reward.level || 1);

      // Update streak if changed
      if (reward.new_streak !== undefined) {
        setStreakDays(reward.new_streak);
      }

      // Update session multiplier if changed
      if (reward.new_multiplier !== undefined || reward.multiplier !== undefined) {
        setSessionMultiplier(reward.new_multiplier || reward.multiplier || 0);
      }

      // Show celebration animation
      setCelebration({
        show: true,
        tier: reward.tier,
        xp: reward.total_xp,
        multiplier: reward.multiplier || 1.0,
        bonusReason: reward.bonus_reason || ''
      });

      // Open mystery box if unlocked
      if (reward.mystery_unlocked && reward.mystery_content) {
        setTimeout(() => {
          setMysteryBox(reward.mystery_content);
        }, 2000);
      }

      // Level up celebration
      if (reward.level_up) {
        setTimeout(() => {
          setQuickCelebrationMsg(`🎉 LEVEL UP! Now Level ${reward.new_level || reward.level}`);
        }, 3000);
      }

    } catch (err) {
      console.error('Reward claim error:', err);
      // Fallback to simple XP increase
      setXp(prev => prev + 0);
    }
  };

  const sliceIntoMicroStep = (t: Task) => {
    const words = t.title.split(" ");
    const suggestion = words.length > 2 ? `${words[0]} ${words.slice(1,3).join(" ")}` : t.title;
    setMicroStep(suggestion + " (2–5 min)");
  };

  const delegateTask = async (task: Task) => {
    const newDelegation = {
      id: delegations.length + 1,
      task: `${task.title} → Agent processing`,
      status: "Queued"
    };
    setDelegations([newDelegation, ...delegations]);
    alert(`Delegated: ${task.title}`);
  };

  const startFocusSession = async (durationMinutes: number) => {
    try {
      // Epic 2.2: AI-powered focus session with real OpenAI GPT-4 integration
      const response = await fetch(`${API_URL}/api/v1/focus/sessions/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_context: `Focus session for current tasks`,
          duration_minutes: durationMinutes,
          technique: 'pomodoro'
        })
      });

      if (!response.ok) {
        console.warn('AI Focus API not available, using basic timer');
        return;
      }

      const sessionData = await response.json();
      console.log('🤖 AI Focus Session started:', sessionData);
      setQuickCelebrationMsg(`🎯 AI Focus: ${durationMinutes}min session started!`);

      // Get AI duration recommendation for next time
      const recResponse = await fetch(`${API_URL}/api/v1/focus/recommend-duration?task_context=current%20work`);
      if (recResponse.ok) {
        const recommendation = await recResponse.json();
        console.log('💡 AI recommends:', recommendation.recommended_duration, 'minutes');
        console.log('📊 Confidence:', (recommendation.confidence * 100).toFixed(0) + '%');
        console.log('🧠 Reasoning:', recommendation.reasoning);
      }
    } catch (err) {
      console.error('Focus session error:', err);
    }
  };

  const toggleBodyDouble = () => setBodyDouble(v => !v);

  const handleQuickCapture = async () => {
    if (!quickCaptureText.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/mobile/quick-capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: quickCaptureText,
          user_id: 'mobile-user',
          voice_input: false,
          auto_mode: autoMode,
          ask_for_clarity: askForClarity
        })
      });

      if (!response.ok) throw new Error('Failed to create task');

      const result = await response.json();

      // Handle clarity mode response
      if (result.needs_clarification) {
        setClarityQuestions(result.questions);
        setShowClarityForm(true);
        setIsLoading(false);
        return;
      }

      // Handle auto mode response with analysis
      if (result.analysis) {
        setTaskAnalysis(result.analysis);
        setShowAnalysisPreview(true);
      }

      setTasks([result.task, ...tasks]);
      setXp(prev => prev + 0);
      setQuickCaptureText("");

      // Collapse expanded state after successful submission
      setIsExpanded(false);
    } catch (err) {
      console.error('Quick capture error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaritySubmit = async (answers: Record<string, any>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/mobile/quick-capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: quickCaptureText,
          user_id: 'mobile-user',
          voice_input: false,
          auto_mode: false,
          ask_for_clarity: false,
          clarity_answers: answers
        })
      });

      if (!response.ok) throw new Error('Failed to create task');

      const result = await response.json();
      setTasks([result.task, ...tasks]);
      setXp(prev => prev + 0);
      setQuickCaptureText("");
      setShowClarityForm(false);
      setClarityQuestions([]);
      setIsExpanded(false);
    } catch (err) {
      console.error('Clarity form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelClarity = () => {
    setShowClarityForm(false);
    setClarityQuestions([]);
    setIsLoading(false);
  };

  // Time of day detection for biological circuits
  useEffect(() => {
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

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // ADHD-specific functions
  const handleSwipeLeft = async (task: Task) => {
    // Dismiss task
    try {
      const taskId = task.task_id || task.id;
      await fetch(`${API_URL}/api/v1/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dismissed' })
      });

      // Move to next task
      setCurrentTaskIndex(prev => Math.min(prev + 1, tasks.length - 1));
      setQuickCelebrationMsg("Task dismissed");
    } catch (err) {
      console.error('Dismiss error:', err);
    }
  };

  const handleSwipeRight = async (task: Task) => {
    // Do Now or Delegate based on task type
    const isDigital = task.is_digital ||
      task.tags?.some(tag => ['digital', 'online', 'email', 'research', 'coding'].includes(tag.toLowerCase())) ||
      task.title.toLowerCase().includes('email') ||
      task.title.toLowerCase().includes('research') ||
      task.title.toLowerCase().includes('code');

    if (isDigital) {
      // Delegate to agents workflow system
      try {
        const response = await fetch(`${API_URL}/api/v1/secretary/delegate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_id: task.task_id || task.id,
            user_id: 'mobile-user',
            delegation_type: 'agent_workflow'
          })
        });

        if (response.ok) {
          setQuickCelebrationMsg("🤖 Delegated to agents!");
          setCurrentTaskIndex(prev => Math.min(prev + 1, tasks.length - 1));
        }
      } catch (err) {
        console.error('Delegation error:', err);
      }
    } else {
      // Mark as "Do Now" and start focus session
      try {
        const taskId = task.task_id || task.id;
        await fetch(`${API_URL}/api/v1/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'in_progress' })
        });

        setQuickCelebrationMsg("⚡ Starting focus session!");
        setCurrentTaskIndex(prev => Math.min(prev + 1, tasks.length - 1));

        // Start focus session
        startFocusSession(25);
      } catch (err) {
        console.error('Do now error:', err);
      }
    }
  };

  const handleTaskTap = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const getCurrentTask = () => {
    return tasks[currentTaskIndex] || null;
  };

  const top3 = tasks.slice(0, 3);

  const DoWithMe = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <Pill text={bodyDouble ? "Body‑Double: ON" : "Body‑Double: OFF"} tone={bodyDouble ? "good" : "neutral"} />
      <div className="flex gap-2">
        <button
          onClick={toggleBodyDouble}
          className="px-3 py-2 rounded-lg border border-[#586e75] text-sm bg-[#073642] text-[#93a1a1] hover:bg-[#002b36] active:bg-[#002b36] transition-colors touch-manipulation"
        >
          {bodyDouble ? "Stop" : "Start"} Do‑With‑Me
        </button>
        <button
          onClick={() => setMicroStep("Start 5‑min Rescue Timer")}
          className="px-3 py-2 rounded-lg bg-[#268bd2] text-[#fdf6e3] text-sm hover:bg-[#2aa198] active:bg-[#859900] transition-colors touch-manipulation"
        >
          5‑min Rescue
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#002b36] flex flex-col">
      {/* Minimal Swipeable Mode Header */}
      <SwipeableModeHeader
        currentMode={biologicalMode}
        onModeChange={setBiologicalMode}
        energy={energy}
      />

      {/* Main Task Card Area */}
      <div className="flex-1 relative">
        {tasks.length > 0 ? (
          <div className="h-full w-full flex items-center justify-center p-4">
            <div className="w-full max-w-md h-96">
              <SwipeableTaskCard
                task={getCurrentTask()!}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onTap={handleTaskTap}
                isActive={true}
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">All caught up!</h2>
              <p className="text-gray-600">No tasks in your current biological mode.</p>
            </div>
          </div>
        )}

        {/* Task Progress Indicator */}
        {tasks.length > 0 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-white rounded-full px-4 py-2 shadow-lg">
              <span className="text-sm font-medium text-gray-700">
                {currentTaskIndex + 1} of {tasks.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      {showTaskDetails && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900">Task Details</h3>
              <button
                onClick={() => setShowTaskDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">{selectedTask.title}</h4>
                {selectedTask.description && (
                  <p className="text-gray-600 mt-2">{selectedTask.description}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Priority</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedTask.priority === 'high' ? 'bg-red-100 text-red-800' :
                  selectedTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedTask.priority || 'medium'}
                </span>
              </div>

              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500 block mb-2">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Celebration Overlays */}
      {celebration?.show && (
        <RewardCelebration
          tier={celebration.tier as any}
          xp={celebration.xp}
          multiplier={celebration.multiplier}
          bonusReason={celebration.bonusReason}
          onComplete={() => setCelebration(null)}
        />
      )}

      {quickCelebrationMsg && (
        <QuickCelebration message={quickCelebrationMsg} />
      )}

      {mysteryBox && (
        <MysteryBoxCelebration
          rewardType={mysteryBox.type}
          content={mysteryBox.content}
          message={mysteryBox.message}
          onComplete={() => setMysteryBox(null)}
        />
      )}
    </div>
  );
}
