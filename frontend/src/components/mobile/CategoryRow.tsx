'use client'

import React, { useRef } from 'react';
import { colors, semanticColors, spacing, borderRadius } from '@/lib/design-system';

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
  icon: React.ReactNode;
  tasks: Task[];
  onTaskTap: (task: Task) => void;
  isMystery?: boolean;
  cardSize?: 'hero' | 'standard' | 'compact';
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  title,
  icon,
  tasks,
  onTaskTap,
  isMystery = false,
  cardSize = 'standard'
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get card dimensions based on size variant
  const getCardDimensions = () => {
    switch (cardSize) {
      case 'hero':
        return { width: '320px', height: '180px', padding: spacing[5] };
      case 'compact':
        return { width: '200px', height: '120px', padding: spacing[3] };
      case 'standard':
      default:
        return { width: '240px', height: '140px', padding: spacing[4] };
    }
  };

  const cardDimensions = getCardDimensions();

  // Get priority color (Solarized)
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return `border-[${colors.red}]`;
      case 'medium':
        return `border-[${colors.yellow}]`;
      case 'low':
        return `border-[${colors.green}]`;
      default:
        return `border-[${colors.base01}]`;
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
    <div style={{ marginBottom: spacing[6] }}>
      {/* Category Header - Netflix Style */}
      <div
        className="flex items-center"
        style={{
          gap: spacing[2],
          marginBottom: spacing[3],
          paddingLeft: spacing[4],
          paddingRight: spacing[4]
        }}
      >
        <span style={{ fontSize: '24px' }}>{icon}</span>
        <h3
          style={{
            fontSize: cardSize === 'hero' ? '20px' : '18px',
            fontWeight: 600,
            color: semanticColors.text.primary,
            letterSpacing: '-0.02em'
          }}
        >
          {title}
        </h3>
        <span
          className="inline-flex items-center justify-center"
          style={{
            marginLeft: 'auto',
            padding: `${spacing[0]} ${spacing[2]}`,
            borderRadius: borderRadius.full,
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: semanticColors.bg.secondary,
            color: semanticColors.text.secondary
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Horizontal Scrolling Task Cards */}
      <div style={{ position: 'relative' }}>
        {/* Left fade gradient */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '24px',
            background: `linear-gradient(to right, ${semanticColors.bg.primary}, transparent)`,
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />

        {/* Right fade gradient - peek next card */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '40px',
            background: `linear-gradient(to left, ${semanticColors.bg.primary} 0%, transparent 100%)`,
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            scrollPaddingLeft: spacing[4],
            scrollPaddingRight: spacing[4]
          }}
        >
        {tasks.map((task) => (
          <div
            key={task.task_id || task.id}
            onClick={() => onTaskTap(task)}
            className={`
              flex-shrink-0 flex flex-col rounded-xl border-2 bg-[#073642]
              ${getPriorityColor(task.priority)}
              cursor-pointer
              transition-all duration-200 ease-out
              active:scale-95
              ${isMystery ? 'bg-gradient-to-br from-[#b58900] to-[#cb4b16] border-[#b58900]' : ''}
            `}
            style={{
              width: cardDimensions.width,
              minHeight: cardDimensions.height,
              padding: cardDimensions.padding,
              boxShadow: isMystery ? '0 8px 24px rgba(181, 137, 0, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.3)',
              transform: 'translateZ(0)', // Enable GPU acceleration
              willChange: 'transform'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02) translateZ(0)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateZ(0)';
            }}
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
            <h4
              className="font-semibold mb-2 line-clamp-2"
              style={{
                color: semanticColors.text.primary,
                fontSize: cardSize === 'hero' ? '16px' : cardSize === 'compact' ? '13px' : '14px',
                lineHeight: 1.4,
                fontWeight: 600
              }}
            >
              {task.title}
            </h4>

            {/* Task Description */}
            {task.description && (
              <p
                className="mb-3 line-clamp-2"
                style={{
                  color: semanticColors.text.secondary,
                  fontSize: cardSize === 'hero' ? '13px' : '12px',
                  lineHeight: 1.5,
                  opacity: 0.9
                }}
              >
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
          <div
            className="flex-shrink-0 rounded-xl border-2 border-dashed"
            style={{
              width: cardDimensions.width,
              minHeight: cardDimensions.height,
              padding: cardDimensions.padding,
              borderColor: semanticColors.border.default,
              backgroundColor: `${semanticColors.bg.secondary}80`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div className="text-center">
              <div style={{ fontSize: '32px', marginBottom: spacing[2] }}>✨</div>
              <p style={{ color: semanticColors.text.secondary, fontSize: fontSize.sm }}>
                No tasks here
              </p>
            </div>
          </div>
        )}
        </div>
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
