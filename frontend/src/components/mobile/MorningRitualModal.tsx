'use client'

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Target, Flame, Sparkles, TrendingUp } from 'lucide-react';
import { colors, semanticColors, spacing, fontSize, borderRadius } from '@/lib/design-system';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Task {
  task_id: string;
  title: string;
  description?: string;
  priority: string;
  estimated_minutes?: number;
  zone?: string;
  ready_now?: boolean;
}

interface MorningRitualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (taskIds: string[]) => void;
  userId?: string;
}

interface RitualStats {
  total_rituals_completed: number;
  current_streak: number;
  completion_rate: number;
}

const MorningRitualModal: React.FC<MorningRitualModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  userId = 'mobile-user'
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<RitualStats | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
      fetchStats();
    }
  }, [isOpen]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // Fetch pending tasks, prioritized by Ready Now and priority
      const response = await fetch(
        `${API_URL}/api/v1/tasks?user_id=${userId}&status=pending&limit=20`
      );

      if (!response.ok) throw new Error('Failed to fetch tasks');

      const data = await response.json();
      const allTasks = data.tasks || [];

      // Sort: Ready Now first, then by priority
      const sorted = allTasks.sort((a: Task, b: Task) => {
        if (a.ready_now && !b.ready_now) return -1;
        if (!a.ready_now && b.ready_now) return 1;

        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority?.toLowerCase() as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.priority?.toLowerCase() as keyof typeof priorityOrder] || 0;
        return bPriority - aPriority;
      });

      setTasks(sorted.slice(0, 15)); // Show max 15 tasks
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/ritual/stats?user_id=${userId}`
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch ritual stats:', err);
    }
  };

  const handleTaskToggle = (taskId: string) => {
    const newSelected = new Set(selectedTasks);

    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      // Limit to 3 tasks
      if (newSelected.size < 3) {
        newSelected.add(taskId);
      }
    }

    setSelectedTasks(newSelected);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      const taskArray = Array.from(selectedTasks);

      const response = await fetch(
        `${API_URL}/api/v1/ritual/complete?user_id=${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            focus_task_1_id: taskArray[0] || null,
            focus_task_2_id: taskArray[1] || null,
            focus_task_3_id: taskArray[2] || null,
            skipped: false
          })
        }
      );

      if (!response.ok) throw new Error('Failed to complete ritual');

      // Show celebration
      setShowCelebration(true);

      // Wait for celebration, then notify parent
      setTimeout(() => {
        onComplete(taskArray);
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Failed to complete ritual:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      await fetch(
        `${API_URL}/api/v1/ritual/complete?user_id=${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            focus_task_1_id: null,
            focus_task_2_id: null,
            focus_task_3_id: null,
            skipped: true
          })
        }
      );
    } catch (err) {
      console.error('Failed to skip ritual:', err);
    }

    onClose();
  };

  if (!isOpen) return null;

  // Celebration overlay
  if (showCelebration) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="text-center animate-bounce">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.yellow }}>
            Ritual Complete!
          </h2>
          <p style={{ color: semanticColors.text.secondary }}>
            Your day is planned
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleSkip();
      }}
    >
      {/* Modal */}
      <div
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up"
        style={{
          backgroundColor: semanticColors.bg.primary,
          maxHeight: '90vh',
          boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Header */}
        <div
          className="relative p-6 text-center"
          style={{
            background: `linear-gradient(135deg, ${colors.orange}20, ${colors.yellow}20)`,
            borderBottom: `2px solid ${colors.orange}40`
          }}
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-full transition-all"
            style={{
              backgroundColor: semanticColors.bg.secondary,
              color: semanticColors.text.secondary
            }}
          >
            <X size={20} />
          </button>

          {/* Streak indicator */}
          {stats && stats.current_streak > 0 && (
            <div
              className="absolute top-4 left-4 px-3 py-1 rounded-full flex items-center gap-1"
              style={{
                backgroundColor: `${colors.red}20`,
                border: `1px solid ${colors.red}`
              }}
            >
              <Flame size={16} style={{ color: colors.red }} />
              <span className="text-sm font-bold" style={{ color: colors.red }}>
                {stats.current_streak}
              </span>
            </div>
          )}

          {/* Title */}
          <div className="text-4xl mb-3">🌅</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: semanticColors.text.primary }}>
            Morning Ritual
          </h2>
          <p className="text-sm" style={{ color: semanticColors.text.secondary }}>
            Pick 3 tasks to conquer today
          </p>

          {/* Stats */}
          {stats && (
            <div className="flex justify-center gap-4 mt-4">
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: colors.green }}>
                  {stats.total_rituals_completed}
                </div>
                <div className="text-xs" style={{ color: semanticColors.text.muted }}>
                  rituals
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: colors.orange }}>
                  {Math.round(stats.completion_rate)}%
                </div>
                <div className="text-xs" style={{ color: semanticColors.text.muted }}>
                  rate
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="px-6 py-3" style={{ backgroundColor: semanticColors.bg.secondary }}>
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-center w-10 h-10 rounded-full transition-all"
                style={{
                  backgroundColor: selectedTasks.size > i ? colors.orange : semanticColors.bg.primary,
                  border: `2px solid ${selectedTasks.size > i ? colors.orange : semanticColors.border.default}`,
                  color: selectedTasks.size > i ? semanticColors.text.inverse : semanticColors.text.secondary
                }}
              >
                {selectedTasks.size > i ? <CheckCircle2 size={20} /> : <Target size={20} />}
              </div>
            ))}
          </div>
          <p className="text-xs text-center mt-2" style={{ color: semanticColors.text.muted }}>
            {selectedTasks.size}/3 tasks selected
          </p>
        </div>

        {/* Task list */}
        <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="text-2xl mb-2">⏳</div>
              <p style={{ color: semanticColors.text.secondary }}>Loading your tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <p style={{ color: semanticColors.text.secondary }}>No pending tasks!</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {tasks.map((task) => {
                const isSelected = selectedTasks.has(task.task_id);
                const canSelect = selectedTasks.size < 3 || isSelected;

                return (
                  <button
                    key={task.task_id}
                    onClick={() => canSelect && handleTaskToggle(task.task_id)}
                    disabled={!canSelect}
                    className="w-full text-left p-3 rounded-lg transition-all"
                    style={{
                      backgroundColor: isSelected
                        ? `${colors.orange}20`
                        : semanticColors.bg.secondary,
                      border: `2px solid ${isSelected ? colors.orange : 'transparent'}`,
                      opacity: canSelect ? 1 : 0.5,
                      cursor: canSelect ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div
                        className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all"
                        style={{
                          backgroundColor: isSelected ? colors.orange : semanticColors.bg.primary,
                          border: `2px solid ${isSelected ? colors.orange : semanticColors.border.default}`
                        }}
                      >
                        {isSelected && <CheckCircle2 size={16} style={{ color: semanticColors.text.inverse }} />}
                      </div>

                      {/* Task info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4
                            className="font-medium truncate"
                            style={{ color: semanticColors.text.primary }}
                          >
                            {task.title}
                          </h4>
                          {task.ready_now && (
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                              style={{
                                backgroundColor: `${colors.green}20`,
                                color: colors.green
                              }}
                            >
                              Ready
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-xs truncate" style={{ color: semanticColors.text.secondary }}>
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {task.estimated_minutes && (
                            <span className="text-xs" style={{ color: semanticColors.text.muted }}>
                              {task.estimated_minutes}min
                            </span>
                          )}
                          {task.zone && (
                            <span className="text-xs" style={{ color: semanticColors.text.muted }}>
                              • {task.zone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t"
          style={{
            backgroundColor: semanticColors.bg.secondary,
            borderColor: semanticColors.border.default
          }}
        >
          <button
            onClick={handleComplete}
            disabled={selectedTasks.size === 0 || isSubmitting}
            className="w-full py-3 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: selectedTasks.size > 0 ? colors.orange : semanticColors.bg.tertiary,
              color: selectedTasks.size > 0 ? semanticColors.text.inverse : semanticColors.text.secondary,
              cursor: selectedTasks.size > 0 ? 'pointer' : 'not-allowed',
              opacity: isSubmitting ? 0.5 : 1
            }}
          >
            {isSubmitting ? (
              'Completing...'
            ) : selectedTasks.size === 0 ? (
              'Select tasks to continue'
            ) : (
              <>
                <Sparkles size={18} className="inline mr-2" />
                Complete Morning Ritual
              </>
            )}
          </button>

          <button
            onClick={handleSkip}
            className="w-full mt-2 py-2 text-sm"
            style={{
              color: semanticColors.text.muted,
              backgroundColor: 'transparent'
            }}
          >
            Skip for today
          </button>
        </div>
      </div>
    </div>
  );
};

export default MorningRitualModal;
