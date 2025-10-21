'use client'

import React, { useState } from 'react';

interface MobileNavigationProps {
  currentSection?: string;
  onSectionChange?: (section: string) => void;
}

const MobileNavigation = ({ currentSection = 'tasks', onSectionChange }: MobileNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const sections = [
    { id: 'tasks', label: 'Tasks', icon: '📋' },
    { id: 'focus', label: 'Focus', icon: '🎯' },
    { id: 'energy', label: 'Energy', icon: '⚡' },
    { id: 'progress', label: 'Progress', icon: '📈' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 sm:hidden">
      <div className="flex justify-around py-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              onSectionChange?.(section.id);
              setIsOpen(false);
            }}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors touch-manipulation ${
              currentSection === section.id
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg mb-1">{section.icon}</span>
            <span className="text-xs font-medium">{section.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
