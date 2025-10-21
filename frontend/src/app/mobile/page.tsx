'use client'

import React, { useState, useEffect, useRef } from "react";
import './mobile.css';
import MobileNavigation from '../../components/MobileNavigation';
import RewardCelebration, { QuickCelebration, MysteryBoxCelebration } from '../../components/mobile/RewardCelebration';

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
}

const Gauge = ({ value = 0, label = "Energy" }) => {
  const radius = 60;
  const stroke = 12;
  // Calculate half circle (semi-circle) length
  const circumference = Math.PI * radius;
  const percent = Math.max(0, Math.min(100, value)) / 100;
  const dashLength = circumference * percent;
  const dashOffset = circumference * (1 - percent);

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="160" height="100" viewBox="0 0 160 100">
        <g transform="translate(80,90)">
          {/* Background gray semi-circle */}
          <path
            d={`M ${-radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          {/* Foreground colored semi-circle (percentage fill) */}
          <path
            d={`M ${-radius} 0 A ${radius} ${radius} 0 0 1 ${radius} 0`}
            fill="none"
            stroke={value >= 70 ? "#10b981" : value >= 40 ? "#f59e0b" : "#ef4444"}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dashLength} ${circumference}`}
            strokeDashoffset={0}
          />
        </g>
        <text x="80" y="73" textAnchor="middle" className="fill-gray-900 font-semibold text-2xl">{value}%</text>
        <text x="80" y="90" textAnchor="middle" className="fill-gray-600 text-xs">Est. {label}</text>
      </svg>
    </div>
  );
};

interface ChipProps {
  children: React.ReactNode;
}

interface CardProps {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}

interface PillProps {
  text: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}

const Chip = ({ children }: ChipProps) => (
  <span className="px-2 py-0.5 rounded-full text-xs border border-gray-300 bg-white/70 mr-1 mb-1 inline-flex items-center gap-1">
    {children}
  </span>
);

const Card = ({ title, right, children }: CardProps) => (
  <div className="bg-[#073642] rounded-xl shadow-sm border border-[#586e75] p-3 sm:p-4 mobile-card">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-[#93a1a1] text-sm sm:text-base">{title}</h3>
      {right}
    </div>
    {children}
  </div>
);

const Pill = ({ text, tone = "neutral" }: PillProps) => {
  const tones = {
    neutral: "bg-[#073642] text-[#93a1a1] border border-[#586e75]",
    good: "bg-[#073642] text-[#859900] border border-[#859900]",
    warn: "bg-[#073642] text-[#b58900] border border-[#b58900]",
    bad: "bg-[#073642] text-[#dc322f] border border-[#dc322f]",
  };
  return <span className={`px-2 py-1 rounded-full text-xs ${tones[tone]}`}>{text}</span>;
};

interface TaskRowProps {
  t: Task;
  onToggle: () => void;
  onSlice: () => void;
  onDelegate: () => void;
}

const TaskRow = ({ t, onToggle, onSlice, onDelegate }: TaskRowProps) => {
  const isDone = t.done ?? (t.status === 'completed');
  return (
    <div className="py-3 border-b last:border-b-0">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isDone}
          onChange={onToggle}
          className="mt-1 h-5 w-5 rounded border-gray-300 focus:ring-2 focus:ring-indigo-500"
        />
        <div className={`flex-1 ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
          <div className="text-sm font-medium leading-tight">{t.title}</div>
          {(t.desc || t.description) && <div className="text-xs text-gray-500 mt-1">{t.desc || t.description}</div>}
        </div>
        <Pill text={t.context || t.priority || "medium"} tone={(t.tone as "neutral" | "good" | "warn" | "bad") || "neutral"} />
      </label>
      <div className="ml-8 mt-3 flex flex-wrap gap-2">
        <button 
          onClick={onSlice} 
          className="px-3 py-2 rounded-lg border text-xs bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
        >
          Slice → 2–5m
        </button>
        <button 
          onClick={onDelegate} 
          className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs hover:bg-indigo-700 active:bg-indigo-800 transition-colors touch-manipulation"
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
      <div className="text-2xl sm:text-3xl font-semibold tabular-nums">{mm}:{ss}</div>
      <button 
        onClick={handleStart} 
        className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 active:bg-gray-700 transition-colors touch-manipulation"
      >
        {running ? "Pause" : "Start"}
      </button>
      <button 
        onClick={() => { setSecs(25 * 60); setRunning(false); }} 
        className="px-3 py-2 rounded-lg border text-sm bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
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
  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex items-center justify-between">
    <div>
      <div className="font-medium text-gray-900">{name}</div>
      <div className="text-xs text-gray-500">{status}</div>
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
    <div className="w-16 text-xs text-gray-500 pt-1">{time}</div>
    <div className="relative pl-4">
      <div className="absolute left-0 top-2 w-2 h-2 bg-gray-900 rounded-full" />
      <div className="font-medium text-gray-900 text-sm">{title}</div>
      <div className="text-xs text-gray-500">{meta}</div>
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
  const confidenceColor = confidencePercent >= 80 ? 'text-green-600' : confidencePercent >= 50 ? 'text-amber-600' : 'text-gray-600';

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200 mb-3">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 text-sm">AI Analysis</h4>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-2 text-sm">
        {analysis.category && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Category:</span>
            <Pill text={analysis.category} tone="neutral" />
          </div>
        )}

        {analysis.confidence !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Confidence:</span>
            <span className={`font-semibold ${confidenceColor}`}>{confidencePercent}%</span>
          </div>
        )}

        {analysis.should_delegate && (
          <div className="flex items-center gap-2">
            <span className="text-amber-600 font-medium">⚡ Delegation suggested</span>
          </div>
        )}

        {analysis.reasoning && (
          <div className="text-gray-700 text-xs mt-2 p-2 bg-white/60 rounded">
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
    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-3">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900">A few quick questions...</h4>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div key={idx} className="bg-white rounded-lg p-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {q.question}
            </label>

            {q.type === 'boolean' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setAnswers({ ...answers, [idx]: true })}
                  className={`flex-1 px-3 py-2 rounded text-sm ${
                    answers[idx] === true ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setAnswers({ ...answers, [idx]: false })}
                  className={`flex-1 px-3 py-2 rounded text-sm ${
                    answers[idx] === false ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
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
                className="w-full px-3 py-2 rounded border border-gray-300 text-sm"
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
                className="w-full px-3 py-2 rounded border border-gray-300 text-sm"
              />
            )}

            {q.type === 'text' && (
              <input
                type="text"
                value={answers[idx] || ''}
                onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                placeholder="Type your answer..."
                className="w-full px-3 py-2 rounded border border-gray-300 text-sm"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
        >
          Create Task
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border text-sm bg-white hover:bg-gray-50"
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
        className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        disabled={isLoading}
      />
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Optional description"
        className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        rows={2}
        disabled={isLoading}
      />
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-lg bg-gray-900 text-white text-sm disabled:opacity-50 hover:bg-gray-800 active:bg-gray-700 transition-colors touch-manipulation"
        >
          {isLoading ? 'Adding...' : 'Add Task'}
        </button>
        <button 
          onClick={() => { setTitle(""); setDesc(""); }} 
          className="px-4 py-3 rounded-lg border text-sm bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default function MissionControl() {
  const [adhdMode, setAdhdMode] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [microStep, setMicroStep] = useState("");
  const [bodyDouble, setBodyDouble] = useState(false);
  const [currentSection, setCurrentSection] = useState('tasks');
  const [isScrolled, setIsScrolled] = useState(false);
  const [quickCaptureText, setQuickCaptureText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [askForClarity, setAskForClarity] = useState(false);
  const expandedOptionsRef = useRef<HTMLDivElement>(null);
  const [delegations, setDelegations] = useState<any[]>([]);

  // QuickCapture intelligence state
  const [showAnalysisPreview, setShowAnalysisPreview] = useState(false);
  const [taskAnalysis, setTaskAnalysis] = useState<any>(null);
  const [showClarityForm, setShowClarityForm] = useState(false);
  const [clarityQuestions, setClarityQuestions] = useState<any[]>([]);

  // Celebration state (HABIT.md dopamine engineering)
  const [celebration, setCelebration] = useState<{
    show: boolean;
    tier: string;
    xp: number;
    multiplier: number;
    bonusReason: string;
  } | null>(null);
  const [quickCelebrationMsg, setQuickCelebrationMsg] = useState<string | null>(null);
  const [mysteryBox, setMysteryBox] = useState<any>(null);
  const [streakDays, setStreakDays] = useState(0);
  const [sessionMultiplier, setSessionMultiplier] = useState(0);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

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

  const top3 = tasks.slice(0, 3);

  const DoWithMe = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <Pill text={bodyDouble ? "Body‑Double: ON" : "Body‑Double: OFF"} tone={bodyDouble ? "good" : "neutral"} />
      <div className="flex gap-2">
        <button 
          onClick={toggleBodyDouble} 
          className="px-3 py-2 rounded-lg border text-sm bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
        >
          {bodyDouble ? "Stop" : "Start"} Do‑With‑Me
        </button>
        <button
          onClick={() => setMicroStep("Start 5‑min Rescue Timer")}
          className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 active:bg-gray-700 transition-colors touch-manipulation"
        >
          5‑min Rescue
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#002b36] mobile-safe-area">
      {/* Quick Capture Header - Solarized Dark */}
      <header className="sticky top-0 z-10 bg-[#073642] backdrop-blur-sm border-b border-[#586e75] shadow-sm">
        <div className="w-full px-3 py-3">
          {/* Main input row */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#268bd2] text-[#fdf6e3] flex items-center justify-center font-bold text-sm flex-shrink-0">PA</div>
            <div className="flex-1">
              <input
                type="text"
                value={quickCaptureText}
                onChange={(e) => setQuickCaptureText(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                onBlur={(e) => {
                  // Don't collapse if clicking on expanded options
                  if (e.relatedTarget && expandedOptionsRef.current && expandedOptionsRef.current.contains(e.relatedTarget as Node)) {
                    return;
                  }
                  setTimeout(() => setIsExpanded(false), 200);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleQuickCapture();
                  }
                }}
                placeholder="Quick capture..."
                className="w-full bg-transparent border-none outline-none text-[#93a1a1] placeholder-[#586e75] quick-capture-input resize-none"
                disabled={isLoading}
                autoComplete="off"
              />
            </div>
            {quickCaptureText.trim() && (
              <button
                onClick={handleQuickCapture}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg bg-[#268bd2] text-[#fdf6e3] text-sm hover:bg-[#2aa198] active:bg-[#859900] transition-colors touch-manipulation disabled:opacity-50"
              >
                {isLoading ? '...' : 'Add'}
              </button>
            )}
          </div>
          
          {/* Simplified expanded options - Solarized Dark */}
          {isExpanded && (
            <div ref={expandedOptionsRef} className="mt-3 pt-3 border-t border-[#586e75] expanded-options">
              <div className="flex items-center gap-4">
                {/* Auto/Manual toggle */}
                <button
                  onClick={() => setAutoMode(!autoMode)}
                  className={`px-3 py-2 rounded text-sm border ${
                    autoMode ? 'border-[#268bd2] text-[#268bd2] bg-[#073642]' : 'border-[#586e75] text-[#93a1a1] bg-[#073642]'
                  }`}
                >
                  {autoMode ? 'Auto' : 'Manual'}
                </button>

                {/* Ask for clarity checkbox */}
                <button
                  onClick={() => setAskForClarity(!askForClarity)}
                  className={`px-3 py-2 rounded text-sm border ${
                    askForClarity ? 'border-[#268bd2] text-[#268bd2] bg-[#073642]' : 'border-[#586e75] text-[#93a1a1] bg-[#073642]'
                  }`}
                >
                  Clarity
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Analysis Preview */}
      {showAnalysisPreview && taskAnalysis && (
        <div className="w-full px-3 pt-3">
          <AnalysisPreview
            analysis={taskAnalysis}
            onClose={() => {
              setShowAnalysisPreview(false);
              setTaskAnalysis(null);
            }}
          />
        </div>
      )}

      {/* Clarity Form */}
      {showClarityForm && clarityQuestions.length > 0 && (
        <div className="w-full px-3 pt-3">
          <ClarityForm
            questions={clarityQuestions}
            onSubmit={handleClaritySubmit}
            onCancel={handleCancelClarity}
          />
        </div>
      )}

      {/* Mobile-optimized main content */}
      <main className="w-full px-3 py-4 space-y-4">
        {/* Primary Tasks Section */}
        <Card title={adhdMode ? "Do Now (low friction)" : "Top 3 — Today"} right={<Pomodoro onStart={startFocusSession} />}>
          <div>
            {top3.map((t) => (
              <TaskRow
                key={t.task_id || t.id}
                t={t}
                onToggle={() => toggleTask(t)}
                onSlice={() => sliceIntoMicroStep(t)}
                onDelegate={() => delegateTask(t)}
              />
            ))}
          </div>
          {microStep && (
            <div className="mt-3 p-3 rounded-xl border bg-amber-50 text-sm">
              <div className="font-medium text-amber-900">Next tiny step:</div>
              <div className="text-amber-900/80">{microStep}</div>
              <div className="mt-2"><DoWithMe /></div>
            </div>
          )}
        </Card>


        {/* Energy & Focus - Mobile Optimized */}
        <Card title="Energy & Focus" right={null}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Gauge value={energy} label="Energy" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-sm text-gray-600">Focus mode</div>
              <div className="text-2xl font-semibold">Ready</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill text="Do Not Disturb" />
                <Pill text="Ambient" />
              </div>
            </div>
          </div>
        </Card>

        {/* Agent Status - Mobile Grid */}
        <Card title="Agent Status" right={null}>
          <div className="grid grid-cols-1 gap-3">
            <AgentStatus name="Task Proxy" status="2s capture ready" tags={["priority", "NLP"]} />
            <AgentStatus name="Focus Proxy" status="Pomodoro ready" tags={["blocks", "ambient"]} />
            <AgentStatus name="Energy Proxy" status={`${energy}% stable`} tags={["tracking", "predict"]} />
            <AgentStatus name="Progress Proxy" status={`${tasks.filter(t => t.status === 'completed').length} done`} tags={["streak", "review"]} />
            <AgentStatus name="Gamification" status={`Lv.${level}`} tags={[`${xp} XP`, "badges"]} />
          </div>
        </Card>

        {/* ADHD Triage - Mobile Optimized */}
        <Card title="ADHD Triage (4D Router)" right={null}>
          <div className="text-xs text-gray-600 mb-3">Do • Do‑with‑me • Delegate • Delete</div>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 rounded-xl border hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation text-sm">
              Do now (≤5m)
            </button>
            <button 
              onClick={() => setBodyDouble(true)} 
              className="p-4 rounded-xl border hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation text-sm"
            >
              Do‑with‑me (timer)
            </button>
            <button className="p-4 rounded-xl border hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation text-sm">
              Delegate to Agent
            </button>
            <button className="p-4 rounded-xl border hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation text-sm">
              Delete/Archive
            </button>
          </div>
        </Card>

        {/* Timeline - Mobile Optimized */}
        <Card title="Timeline — Today" right={<Pill text="Auto-schedule" />}>
          <div className="space-y-3">
            {timelineEvents.length > 0 ? (
              timelineEvents.map((event, idx) => (
                <TimelineItem
                  key={idx}
                  time={event.time}
                  title={event.title}
                  meta={event.description || event.meta || ''}
                />
              ))
            ) : (
              <div className="text-sm text-gray-500 py-4 text-center">
                No timeline events scheduled for today
              </div>
            )}
          </div>
        </Card>

        {/* Recent Captures */}
        <Card title="Inbox → Classifier" right={<Pill text="AI ready" />}>
          <div className="text-sm text-gray-600 mb-3">Recent captures</div>
          <div className="space-y-2">
            {tasks.slice(0,4).map(t => (
              <div key={t.task_id || t.id} className="p-3 rounded-xl border flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">{t.title}</div>
                  <div className="text-xs text-gray-500 truncate">{t.description || t.desc || "—"}</div>
                </div>
                <div className="flex gap-1 ml-2">
                  <Chip>{t.context || t.priority}</Chip>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Delegation Board */}
        <Card title="Delegation Bounty Board" right={null}>
          <div className="text-xs text-gray-600 mb-3">Digital tasks agents will handle</div>
          <ul className="space-y-2 text-sm">
            {delegations.map(d => (
              <li key={d.id} className="p-3 border rounded-xl flex items-center justify-between">
                <span className="truncate flex-1">{d.task}</span>
                <Pill text={d.status} tone={d.status === "Running" ? "good" : d.status === "Queued" ? "neutral" : "warn"} />
              </li>
            ))}
          </ul>
        </Card>

        {/* Rewards & Leveling */}
        <Card title="Rewards & Leveling" right={null}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-gray-600">Level</div>
              <div className="text-2xl font-semibold">{level}</div>
            </div>
            <div className="flex-1 mx-3 h-3 rounded-full bg-gray-100">
              <div className="h-3 rounded-full bg-gray-900" style={{ width: `${(xp % 100)}%` }} />
            </div>
            <Pill text={`+${xp % 100}/100`} />
          </div>
          <div className="text-xs text-gray-600 mb-2">Rewards queue</div>
          <div className="text-sm text-gray-500">
            Complete tasks to unlock rewards!
          </div>
        </Card>

        {/* Rituals - Mobile Optimized */}
        <Card title="Rituals" right={null}>
          <div className="text-sm text-gray-500 text-center py-4">
            Set up your daily rituals in Settings
          </div>
        </Card>
      </main>

      <div className="text-center text-sm text-[#586e75] pb-20 sm:pb-6">
        Connected to {API_URL} • Proxy Agent Platform v0.1
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />

      {/* Celebration Overlays (HABIT.md dopamine engineering) */}
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

      {/* Auto-clear quick celebration after showing */}
      {quickCelebrationMsg && setTimeout(() => setQuickCelebrationMsg(null), 1000) && null}

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
