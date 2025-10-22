'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ArrowUp, Zap, MessageCircle, Lightbulb, Clock } from 'lucide-react';
import { spacing, fontSize, borderRadius, iconSize, semanticColors } from '@/lib/design-system';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface CapturePageProps {
  onTaskCaptured?: () => void;
}

const CapturePage: React.FC<CapturePageProps> = ({ onTaskCaptured }) => {
  const [captureText, setCaptureText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentCaptures, setRecentCaptures] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [askForClarity, setAskForClarity] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    const focusTextarea = () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    };
    
    requestAnimationFrame(focusTextarea);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('recentCaptures');
    if (saved) {
      setRecentCaptures(JSON.parse(saved));
    }
  }, []);

  // Debounce capture to prevent multiple rapid submissions
  const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCapture = useCallback(async () => {
    if (!captureText.trim() || isProcessing) return;

    // Clear any pending capture
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/mobile/quick-capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: captureText,
          user_id: 'mobile-user',
          voice_input: false,
          auto_mode: autoMode,
          ask_for_clarity: askForClarity
        })
      });

      if (!response.ok) throw new Error('Failed to capture task');

      const result = await response.json();

      if (result.needs_clarification) {
        console.log('Clarity questions:', result.questions);
      }

      const newCaptures = [captureText, ...recentCaptures.slice(0, 4)];
      setRecentCaptures(newCaptures);
      localStorage.setItem('recentCaptures', JSON.stringify(newCaptures));

      setCaptureText('');
      setShowSuccess(true);
      setCaptureCount(prev => prev + 1);

      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        setTimeout(() => setShowSuccess(false), 2000);
      });
      
      onTaskCaptured?.();
      
      // Focus textarea after state updates
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });

    } catch (err) {
      console.error('Capture error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [captureText, isProcessing, autoMode, askForClarity, recentCaptures, onTaskCaptured, API_URL]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCapture();
    }
  };

  const quickPrompts = [
    "Email John about the project update",
    "Buy groceries for dinner tonight",
    "Schedule dentist appointment"
  ];

  const handleQuickPrompt = (prompt: string) => {
    setCaptureText(prompt);
    textareaRef.current?.focus();
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: semanticColors.bg.primary }}>
      {/* Top Content - Scrollable - 4px grid */}
      <div className="flex-1 overflow-y-auto" style={{ padding: spacing[4] }}>
        {/* Success Feedback - 4px grid */}
        {showSuccess && (
          <div
            className="bg-gradient-to-r from-[#859900] to-[#2aa198] text-center font-bold"
            style={{
              marginBottom: spacing[2],
              padding: spacing[2],
              borderRadius: borderRadius.base,
              fontSize: fontSize.sm,
              color: semanticColors.text.primary
            }}
          >
            ✅ Captured!
          </div>
        )}

        {/* Quick Examples - 4px grid */}
        <div style={{ marginBottom: spacing[2] }}>
          <div className="flex items-center" style={{ gap: spacing[2], marginBottom: spacing[1] }}>
            <Lightbulb size={iconSize.sm} style={{ color: semanticColors.text.secondary }} />
            <h3 style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary, fontWeight: 'bold' }}>
              Examples
            </h3>
          </div>
          <div className="grid grid-cols-1" style={{ gap: spacing[1] }}>
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(prompt)}
                className="text-left hover:bg-[#002b36] hover:border-[#2aa198] transition-all"
                style={{
                  padding: spacing[2],
                  backgroundColor: semanticColors.bg.secondary,
                  color: semanticColors.text.primary,
                  borderRadius: borderRadius.sm,
                  fontSize: fontSize.xs,
                  border: `1px solid ${semanticColors.border.default}`
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Captures - 4px grid */}
        {recentCaptures.length > 0 && (
          <div style={{ marginBottom: spacing[2] }}>
            <div className="flex items-center" style={{ gap: spacing[2], marginBottom: spacing[1] }}>
              <Clock size={iconSize.sm} style={{ color: semanticColors.text.secondary }} />
              <h3 style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary, fontWeight: 'bold' }}>
                Recent
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
              {recentCaptures.slice(0, 2).map((capture, index) => (
                <div
                  key={index}
                  style={{
                    padding: spacing[2],
                    backgroundColor: semanticColors.bg.secondary,
                    borderRadius: borderRadius.sm,
                    border: `1px solid ${semanticColors.border.default}`
                  }}
                >
                  <p className="line-clamp-1" style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary }}>
                    {capture}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Chatbox - Snapped to Bottom - 4px grid */}
      <div
        style={{
          backgroundColor: semanticColors.bg.primary,
          padding: `${spacing[2]} ${spacing[4]} ${spacing[4]}`,
          borderTop: `1px solid ${semanticColors.bg.secondary}`
        }}
      >
        {/* Textarea with embedded controls - 4px grid */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={captureText}
            onChange={(e) => setCaptureText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="'Email Sarah by Friday' or 'Buy milk'"
            className="w-full resize-none focus:outline-none placeholder-[#586e75]"
            style={{
              height: spacing[28],
              padding: spacing[3],
              paddingRight: spacing[12],
              paddingBottom: spacing[8],
              backgroundColor: semanticColors.bg.secondary,
              color: semanticColors.text.primary,
              borderRadius: borderRadius['2xl'],
              border: `2px solid ${semanticColors.border.accent}`,
              fontSize: fontSize.sm
            }}
            disabled={isProcessing}
          />
          {/* Stylized toggle chips in bottom left - 4px grid */}
          <div className="absolute flex" style={{ bottom: spacing[2], left: spacing[2], gap: spacing[1] }}>
            <label
              className="flex items-center cursor-pointer transition-all"
              style={{
                gap: spacing[1],
                padding: `${spacing[1]} ${spacing[2]}`,
                borderRadius: borderRadius.full,
                backgroundColor: autoMode ? semanticColors.accent.primary : `${semanticColors.bg.primary}CC`,
                color: autoMode ? semanticColors.text.inverse : semanticColors.text.secondary,
                border: `1px solid ${autoMode ? semanticColors.accent.primary : `${semanticColors.border.default}80`}`
              }}
            >
              <input
                type="checkbox"
                checked={autoMode}
                onChange={(e) => setAutoMode(e.target.checked)}
                className="hidden"
              />
              <Zap size={12} />
            </label>
            <label
              className="flex items-center cursor-pointer transition-all"
              style={{
                gap: spacing[1],
                padding: `${spacing[1]} ${spacing[2]}`,
                borderRadius: borderRadius.full,
                backgroundColor: askForClarity ? semanticColors.accent.secondary : `${semanticColors.bg.primary}CC`,
                color: askForClarity ? semanticColors.text.inverse : semanticColors.text.secondary,
                border: `1px solid ${askForClarity ? semanticColors.accent.secondary : `${semanticColors.border.default}80`}`
              }}
            >
              <input
                type="checkbox"
                checked={askForClarity}
                onChange={(e) => setAskForClarity(e.target.checked)}
                className="hidden"
              />
              <MessageCircle size={12} />
            </label>
          </div>
          {/* Submit button in bottom right - 4px grid */}
          <button
            onClick={handleCapture}
            disabled={!captureText.trim() || isProcessing}
            className="absolute flex items-center justify-center transition-all hover:scale-110"
            style={{
              bottom: spacing[2],
              right: spacing[2],
              width: spacing[8],
              height: spacing[8],
              borderRadius: borderRadius.full,
              background: captureText.trim() && !isProcessing
                ? `linear-gradient(to right, ${semanticColors.accent.primary}, ${semanticColors.accent.secondary})`
                : semanticColors.bg.secondary,
              color: captureText.trim() && !isProcessing ? semanticColors.text.primary : semanticColors.text.secondary,
              border: captureText.trim() && !isProcessing ? 'none' : `1px solid ${semanticColors.border.default}`,
              cursor: !captureText.trim() || isProcessing ? 'not-allowed' : 'pointer'
            }}
          >
            {isProcessing ? (
              <Zap size={iconSize.sm} className="animate-pulse" />
            ) : (
              <ArrowUp size={iconSize.sm} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CapturePage;
