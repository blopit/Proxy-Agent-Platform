'use client'

import React, { useState, useEffect } from "react";

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

const Gauge = ({ value = 72, label = "Energy" }) => {
  const radius = 60;
  const stroke = 12;
  const norm = 2 * Math.PI * radius;
  const percent = Math.max(0, Math.min(100, value)) / 100;
  const dash = norm * percent;
  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="160" height="100" viewBox="0 0 160 100">
        <g transform="translate(80,90)">
          <path d={`M ${-radius} 0 A ${radius} ${radius} 0 1 1 ${radius} 0`} fill="none" stroke="#e5e7eb" strokeWidth={stroke} strokeLinecap="round"/>
          <path d={`M ${-radius} 0 A ${radius} ${radius} 0 1 1 ${radius} 0`} fill="none" stroke="#111827" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${dash} ${norm}`} />
        </g>
        <text x="80" y="60" textAnchor="middle" className="fill-gray-900 font-semibold text-xl">{value}%</text>
      </svg>
      <div className="text-sm text-gray-600 -mt-2">{label}</div>
    </div>
  );
};

const Chip = ({ children }) => (
  <span className="px-2 py-0.5 rounded-full text-xs border border-gray-300 bg-white/70 mr-1 mb-1 inline-flex items-center gap-1">
    {children}
  </span>
);

const Card = ({ title, right, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-5">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      {right}
    </div>
    {children}
  </div>
);

const Pill = ({ text, tone = "neutral" }) => {
  const tones = {
    neutral: "bg-gray-100 text-gray-800",
    good: "bg-green-100 text-green-800",
    warn: "bg-amber-100 text-amber-900",
    bad: "bg-rose-100 text-rose-800",
  };
  return <span className={`px-2 py-1 rounded-full text-xs ${tones[tone]}`}>{text}</span>;
};

const TaskRow = ({ t, onToggle, onSlice, onDelegate }) => {
  const isDone = t.done ?? (t.status === 'completed');
  return (
    <div className="py-2 border-b last:border-b-0">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isDone}
          onChange={onToggle}
          className="mt-1 h-4 w-4 rounded border-gray-300"
        />
        <div className={`flex-1 ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
          <div className="text-sm font-medium">{t.title}</div>
          {(t.desc || t.description) && <div className="text-xs text-gray-500">{t.desc || t.description}</div>}
        </div>
        <Pill text={t.context || t.priority || "medium"} tone={t.tone || "neutral"} />
      </label>
      <div className="ml-7 mt-2 flex gap-2">
        <button onClick={onSlice} className="px-2 py-1 rounded-full border text-xs hover:bg-gray-50">
          Slice → 2–5m
        </button>
        <button onClick={onDelegate} className="px-2 py-1 rounded-full bg-indigo-600 text-white text-xs hover:bg-indigo-700">
          Delegate → Agent
        </button>
      </div>
    </div>
  );
};

const Pomodoro = ({ onStart }) => {
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
    <div className="flex items-center gap-3">
      <div className="text-3xl font-semibold tabular-nums">{mm}:{ss}</div>
      <button onClick={handleStart} className="px-3 py-1.5 rounded-full bg-gray-900 text-white text-sm">
        {running ? "Pause" : "Start"}
      </button>
      <button onClick={() => { setSecs(25 * 60); setRunning(false); }} className="px-3 py-1.5 rounded-full border text-sm">
        Reset
      </button>
    </div>
  );
};

const AgentStatus = ({ name, status, tags = [] }) => (
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

const TimelineItem = ({ time, title, meta }) => (
  <div className="flex gap-3 items-start">
    <div className="w-16 text-xs text-gray-500 pt-1">{time}</div>
    <div className="relative pl-4">
      <div className="absolute left-0 top-2 w-2 h-2 bg-gray-900 rounded-full" />
      <div className="font-medium text-gray-900 text-sm">{title}</div>
      <div className="text-xs text-gray-500">{meta}</div>
    </div>
  </div>
);

const QuickCapture = ({ onAdd, isLoading }) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd({ title, desc });
    setTitle("");
    setDesc("");
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && e.metaKey && handleAdd()}
        placeholder="Quick capture (⌘⏎ to add)"
        className="w-full rounded-xl border px-3 py-2 text-sm"
        disabled={isLoading}
      />
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Optional description"
        className="w-full rounded-xl border px-3 py-2 text-sm"
        disabled={isLoading}
      />
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={isLoading}
          className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm disabled:opacity-50"
        >
          {isLoading ? 'Adding...' : 'Add Task'}
        </button>
        <button onClick={() => { setTitle(""); setDesc(""); }} className="px-3 py-2 rounded-lg border text-sm">
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
  const [level, setLevel] = useState(1);
  const [energy, setEnergy] = useState(72);
  const [isLoading, setIsLoading] = useState(false);
  const [microStep, setMicroStep] = useState("");
  const [bodyDouble, setBodyDouble] = useState(false);
  const [delegations, setDelegations] = useState([
    { id: 1, task: "Email triage → Reply drafts", status: "Queued" },
    { id: 2, task: "Calendar clean-up → propose blocks", status: "Running" },
    { id: 3, task: "Web research → 3‑bullet brief", status: "Spec needed" },
  ]);

  useEffect(() => {
    fetchTasks();
    fetchGameStats();
    fetchEnergy();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/simple-tasks?limit=20`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const fetchGameStats = async () => {
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    setXp(completedCount * 25);
    setLevel(Math.floor(completedCount / 4) + 1);
  };

  const fetchEnergy = async () => {
    try {
      setEnergy(72);
    } catch (err) {
      console.error('Energy fetch error:', err);
    }
  };

  const addTask = async ({ title, desc }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/mobile/quick-capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: title,
          user_id: 'mobile-user',
          voice_input: false
        })
      });

      if (!response.ok) throw new Error('Failed to create task');

      const result = await response.json();
      setTasks([result.task, ...tasks]);
      setXp(prev => prev + 10);
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

      if (newStatus === 'completed') {
        setXp(prev => prev + 25);
      }
    } catch (err) {
      console.error('Toggle error:', err);
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
      console.log(`Starting ${durationMinutes}-minute focus session`);
    } catch (err) {
      console.error('Focus session error:', err);
    }
  };

  const toggleBodyDouble = () => setBodyDouble(v => !v);

  const top3 = tasks.slice(0, 3);

  const DoWithMe = () => (
    <div className="flex items-center gap-2">
      <Pill text={bodyDouble ? "Body‑Double: ON" : "Body‑Double: OFF"} tone={bodyDouble ? "good" : "neutral"} />
      <button onClick={toggleBodyDouble} className="px-3 py-1.5 rounded-full border text-sm">
        {bodyDouble ? "Stop" : "Start"} Do‑With‑Me
      </button>
      <button
        onClick={() => setMicroStep("Start 5‑min Rescue Timer")}
        className="px-3 py-1.5 rounded-full bg-gray-900 text-white text-sm"
      >
        5‑min Rescue
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold">PA</div>
            <div>
              <div className="font-semibold text-gray-900">Proxy Agent — Mission Control</div>
              <div className="text-xs text-gray-500">Personal OS • Tasks • Energy • Focus • Progress</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Pill text={`Lv.${level} • ${xp} XP`} tone="good" />
            <Pill text={adhdMode ? "ADHD Mode" : "Standard"} tone={adhdMode ? "warn" : "neutral"} />
            <button onClick={() => setAdhdMode(v => !v)} className="px-3 py-1.5 rounded-full border text-sm">Toggle</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-5">
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
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip>Deep Work</Chip>
              <Chip>No-Scroll</Chip>
              <Chip>Noise Cancel</Chip>
              <Chip>Novelty Burst</Chip>
            </div>
            {microStep && (
              <div className="mt-3 p-3 rounded-xl border bg-amber-50 text-sm">
                <div className="font-medium text-amber-900">Next tiny step:</div>
                <div className="text-amber-900/80">{microStep}</div>
                <div className="mt-2"><DoWithMe /></div>
              </div>
            )}
          </Card>

          <Card title="Quick Capture">
            <QuickCapture onAdd={addTask} isLoading={isLoading} />
          </Card>

          <Card title="Agent Status">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AgentStatus name="Task Proxy" status="2s capture ready" tags={["priority", "NLP"]} />
              <AgentStatus name="Focus Proxy" status="Pomodoro ready" tags={["blocks", "ambient"]} />
              <AgentStatus name="Energy Proxy" status={`${energy}% stable`} tags={["tracking", "predict"]} />
              <AgentStatus name="Progress Proxy" status={`${tasks.filter(t => t.status === 'completed').length} done`} tags={["streak", "review"]} />
              <AgentStatus name="Gamification" status={`Lv.${level}`} tags={[`${xp} XP`, "badges"]} />
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Energy & Focus">
            <div className="grid grid-cols-2 gap-4">
              <Gauge value={energy} label="Energy" />
              <div className="flex flex-col justify-center">
                <div className="text-sm text-gray-600">Focus mode</div>
                <div className="text-2xl font-semibold">Ready</div>
                <div className="mt-2 flex gap-2">
                  <Pill text="Do Not Disturb" />
                  <Pill text="Ambient" />
                </div>
              </div>
            </div>
          </Card>

          <Card title="Timeline — Today" right={<Pill text="Auto-schedule" />}>
            <div className="space-y-4">
              <TimelineItem time="08:30" title="Hydrate + 10m mobility" meta="Energy warm-up" />
              <TimelineItem time="09:00" title="Deep work block" meta="Top 3 tasks" />
              <TimelineItem time="11:00" title="Errands & admin" meta="Quick wins" />
              <TimelineItem time="14:00" title="Workout" meta="Zone 2 + stretch" />
              <TimelineItem time="20:30" title="Review + plan tomorrow" meta="3 lines • gratitude" />
            </div>
          </Card>

          <Card title="Rituals">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl border">
                <div className="font-medium text-gray-900">Launch (AM)</div>
                <ul className="mt-1 list-disc list-inside text-gray-600">
                  <li>Water → move → sunlight</li>
                  <li>Top 3 commit</li>
                  <li>Start focus block</li>
                </ul>
              </div>
              <div className="p-3 rounded-xl border">
                <div className="font-medium text-gray-900">Shutdown (PM)</div>
                <ul className="mt-1 list-disc list-inside text-gray-600">
                  <li>Archive/reschedule</li>
                  <li>3-line log</li>
                  <li>Phone to charge bay</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Inbox → Classifier" right={<Pill text="AI ready" />}>
            <div className="text-sm text-gray-600 mb-2">Recent captures</div>
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

          <Card title="ADHD Triage (4D Router)">
            <div className="text-xs text-gray-600 mb-2">Do • Do‑with‑me • Delegate • Delete</div>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-3 rounded-xl border hover:bg-gray-50">Do now (≤5m)</button>
              <button onClick={() => setBodyDouble(true)} className="p-3 rounded-xl border hover:bg-gray-50">Do‑with‑me (timer)</button>
              <button className="p-3 rounded-xl border hover:bg-gray-50">Delegate to Agent</button>
              <button className="p-3 rounded-xl border hover:bg-gray-50">Delete/Archive</button>
            </div>
          </Card>

          <Card title="Delegation Bounty Board">
            <div className="text-xs text-gray-600 mb-2">Digital tasks agents will handle</div>
            <ul className="space-y-2 text-sm">
              {delegations.map(d => (
                <li key={d.id} className="p-3 border rounded-xl flex items-center justify-between">
                  <span className="truncate flex-1">{d.task}</span>
                  <Pill text={d.status} tone={d.status === "Running" ? "good" : d.status === "Queued" ? "neutral" : "warn"} />
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Rewards & Leveling">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Level</div>
                <div className="text-2xl font-semibold">{level}</div>
              </div>
              <div className="flex-1 mx-3 h-3 rounded-full bg-gray-100">
                <div className="h-3 rounded-full bg-gray-900" style={{ width: `${(xp % 100)}%` }} />
              </div>
              <Pill text={`+${xp % 100}/100`} />
            </div>
            <div className="mt-3 text-xs text-gray-600">Rewards queue</div>
            <div className="mt-1 flex flex-wrap gap-2">
              <Chip>New runners</Chip>
              <Chip>Book hour</Chip>
              <Chip>Day hike</Chip>
            </div>
          </Card>
        </div>
      </main>

      <div className="text-center text-sm text-gray-500 pb-6">
        Connected to {API_URL} • Proxy Agent Platform v0.1
      </div>
    </div>
  );
}
