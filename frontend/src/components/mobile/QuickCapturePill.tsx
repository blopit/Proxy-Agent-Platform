'use client'

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface QuickCapturePillProps {
  onAdd: (task: { title: string; desc: string }) => void;
  isLoading: boolean;
}

const QuickCapturePill: React.FC<QuickCapturePillProps> = ({ onAdd, isLoading }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd({ title, desc });
    setTitle("");
    setDesc("");
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setTitle("");
    setDesc("");
    setIsExpanded(false);
  };

  if (isExpanded) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#002b36] border-b border-[#073642] p-4 pb-safe">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[#93a1a1]">Quick Capture</h3>
            <button
              onClick={handleCancel}
              className="text-[#586e75] hover:text-[#93a1a1] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAdd()}
            placeholder="What needs to be done?"
            className="w-full rounded-lg border border-[#586e75] px-3 py-2 text-sm bg-[#073642] text-[#93a1a1] placeholder-[#586e75] focus:ring-2 focus:ring-[#268bd2] focus:border-[#268bd2]"
            disabled={isLoading}
            autoFocus
          />

          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Details (optional)"
            className="w-full rounded-lg border border-[#586e75] px-3 py-2 text-sm bg-[#073642] text-[#93a1a1] placeholder-[#586e75] focus:ring-2 focus:ring-[#268bd2] focus:border-[#268bd2] resize-none"
            rows={2}
            disabled={isLoading}
          />

          <button
            onClick={handleAdd}
            disabled={isLoading || !title.trim()}
            className="w-full px-4 py-2 rounded-lg bg-[#268bd2] text-[#fdf6e3] text-sm disabled:opacity-50 hover:bg-[#2aa198] active:bg-[#859900] transition-colors"
          >
            {isLoading ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsExpanded(true)}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#268bd2] text-[#fdf6e3] px-4 py-2 rounded-full shadow-lg border border-[#268bd2] hover:bg-[#2aa198] active:bg-[#859900] transition-all duration-300 flex items-center gap-2"
    >
      <Plus size={16} />
      <span className="text-sm font-medium">Quick Capture</span>
    </button>
  );
};

export default QuickCapturePill;
