'use client'

import React, { useRef } from 'react';

interface Task {
  task_id?: string;
  id?: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  estimated_hours?: number;
  tags?: string[];
  is_digital?: boolean;
}

interface CategoryRowProps {
  title: string;
  icon: string;
  tasks: Task[];
  onTaskTap: (task: Task) => void;
  isMystery?: boolean;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  title,
  icon,
  tasks,
  onTaskTap,
  isMystery = false
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get priority color (Solarized)
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'border-[#dc322f]';
      case 'medium':
        return 'border-[#b58900]';
      case 'low':
        return 'border-[#859900]';
      default:
        return 'border-[#586e75]';
    }
  };

  // Get estimated time display
  const getTimeDisplay = (task: Task) => {
    if (task.estimated_hours) {
      if (task.estimated_hours < 1) {
        return `${Math.round(task.estimated_hours * 60)}m`;
      }
      return `${task.estimated_hours}h`;
    }
    return '15m';
  };

  if (tasks.length === 0 && !isMystery) return null;

  return (
    <div className="mb-6">
      {/* Category Header */}
      <div className="flex items-center gap-2 mb-3 px-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-bold text-[#93a1a1]">{title}</h3>
        <span className="text-sm text-[#586e75] ml-auto">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* Horizontal Scrolling Task Cards */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 px-4 snap-x snap-mandatory scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {tasks.map((task) => (
          <div
            key={task.task_id || task.id}
            onClick={() => onTaskTap(task)}
            className={`
              flex-shrink-0 w-64 p-4 rounded-xl border-2 bg-[#073642]
              ${getPriorityColor(task.priority)}
              snap-start cursor-pointer
              transition-all duration-200
              active:scale-95 active:shadow-lg
              ${isMystery ? 'bg-gradient-to-br from-[#b58900] to-[#cb4b16] border-[#b58900]' : ''}
            `}
          >
            {/* Mystery Box Indicator */}
            {isMystery && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🎁</span>
                <span className="text-xs text-[#fdf6e3] font-bold uppercase tracking-wide">
                  Mystery Task
                </span>
              </div>
            )}

            {/* Task Title */}
            <h4 className="text-[#93a1a1] font-semibold mb-2 line-clamp-2">
              {task.title}
            </h4>

            {/* Task Description */}
            {task.description && (
              <p className="text-[#586e75] text-sm mb-3 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Bottom Row: Time + Priority */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#586e75]/30">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#586e75]">⏱️</span>
                <span className="text-xs text-[#93a1a1]">{getTimeDisplay(task)}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Digital task indicator */}
                {task.is_digital && (
                  <span className="text-xs">🤖</span>
                )}

                {/* Priority badge */}
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-medium
                  ${task.priority === 'high' ? 'bg-[#dc322f] text-[#fdf6e3]' :
                    task.priority === 'medium' ? 'bg-[#b58900] text-[#fdf6e3]' :
                    'bg-[#859900] text-[#fdf6e3]'}
                `}>
                  {task.priority || 'med'}
                </span>
              </div>
            </div>

            {/* Tags (if any) */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-[#002b36] text-[#586e75] rounded-full text-xs border border-[#586e75]"
                  >
                    {tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="px-2 py-0.5 text-[#586e75] text-xs">
                    +{task.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="flex-shrink-0 w-64 p-6 rounded-xl border-2 border-dashed border-[#586e75] bg-[#073642]/50">
            <div className="text-center">
              <div className="text-4xl mb-2">✨</div>
              <p className="text-[#586e75] text-sm">No tasks in this category</p>
            </div>
          </div>
        )}
      </div>

      {/* Hide scrollbar CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default CategoryRow;
