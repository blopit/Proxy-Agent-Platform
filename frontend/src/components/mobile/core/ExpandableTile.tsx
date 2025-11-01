'use client'

import React, { useState, useRef, useEffect } from 'react';

interface ExpandableTileProps {
  microContent: React.ReactNode;
  expandedContent: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  onExpandChange?: (expanded: boolean) => void;
}

const ExpandableTile: React.FC<ExpandableTileProps> = ({
  microContent,
  expandedContent,
  defaultExpanded = false,
  className = '',
  onExpandChange
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [height, setHeight] = useState<number | 'auto'>(defaultExpanded ? 'auto' : 96);
  const expandedRef = useRef<HTMLDivElement>(null);
  const microRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && expandedRef.current) {
      const contentHeight = expandedRef.current.scrollHeight;
      setHeight(contentHeight);
    } else if (!isExpanded && microRef.current) {
      const contentHeight = microRef.current.scrollHeight;
      setHeight(contentHeight || 96);
    }
  }, [isExpanded]);

  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onExpandChange?.(newState);
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg bg-[#073642] border cursor-pointer
        transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        hover:border-[#93a1a1] active:scale-[0.98]
        ${isExpanded ? 'border-[#268bd2] shadow-lg shadow-[#268bd2]/20' : 'border-[#586e75]'}
        ${className}
      `}
      style={{ height: height === 'auto' ? 'auto' : `${height}px` }}
      onClick={toggleExpanded}
    >
      {/* Micro View - Visible when collapsed */}
      <div
        ref={microRef}
        className={`
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isExpanded
            ? 'opacity-0 scale-95 absolute inset-0 pointer-events-none translate-y-4'
            : 'opacity-100 scale-100 translate-y-0'
          }
        `}
      >
        {microContent}
      </div>

      {/* Expanded View - Visible when expanded */}
      <div
        ref={expandedRef}
        className={`
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isExpanded
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 absolute inset-0 pointer-events-none -translate-y-4'
          }
        `}
      >
        {expandedContent}
      </div>

      {/* Expand/Collapse Indicator */}
      <div
        className={`
          absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center
          bg-[#002b36] rounded-full border shadow-md z-10
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          hover:scale-110 active:scale-95
          ${isExpanded
            ? 'rotate-180 border-[#268bd2] bg-[#073642]'
            : 'rotate-0 border-[#586e75]'
          }
        `}
      >
        <span
          className={`text-xs transition-colors duration-300 ${
            isExpanded ? 'text-[#268bd2]' : 'text-[#586e75]'
          }`}
        >
          🔽
        </span>
      </div>

      {/* Glow effect when expanded */}
      {isExpanded && (
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: 'radial-gradient(circle at top, rgba(38, 139, 210, 0.05) 0%, transparent 70%)'
          }}
        />
      )}
    </div>
  );
};

export default ExpandableTile;
