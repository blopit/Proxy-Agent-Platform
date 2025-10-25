'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { spacing, fontSize, borderRadius, iconSize, semanticColors, colors } from '@/lib/design-system';
import Ticker from '@/components/mobile/Ticker';

interface CapturePageProps {
  onTaskCaptured?: () => void;
  onExampleClick?: (text: string) => void;
  suggestionsVisible?: boolean;
  suggestionExamples?: string[];
  suggestionLabels?: string[];
}

const CapturePage: React.FC<CapturePageProps> = React.memo(({
  onTaskCaptured,
  onExampleClick,
  suggestionsVisible = true,
  suggestionExamples = [],
  suggestionLabels = []
}) => {
  const [recentCaptures, setRecentCaptures] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('recentCaptures');
    if (saved) {
      setRecentCaptures(JSON.parse(saved));
    }
  }, []);

  // Auto-scroll to bottom on mount and when recentCaptures change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [recentCaptures.length]);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: semanticColors.bg.primary }}>
      {/* Scrollable Content - Recent Captures at top, Suggestions at bottom */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto" style={{ padding: spacing[4], paddingBottom: '200px' }}>
        {/* Recent Captures */}
        {recentCaptures.length > 0 && (
          <div style={{ marginBottom: spacing[6] }}>
            <div className="flex items-center" style={{ gap: spacing[2], marginBottom: spacing[2] }}>
              <Clock size={iconSize.sm} style={{ color: semanticColors.text.secondary }} />
              <h3 style={{ fontSize: fontSize.sm, color: semanticColors.text.secondary, fontWeight: 'bold' }}>
                Recent
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              {recentCaptures.map((capture, index) => (
                <div
                  key={index}
                  style={{
                    padding: spacing[3],
                    backgroundColor: semanticColors.bg.secondary,
                    borderRadius: borderRadius.md,
                    border: `1px solid ${semanticColors.border.default}`
                  }}
                >
                  <p style={{ fontSize: fontSize.sm, color: semanticColors.text.primary }}>
                    {capture}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions - scrolls with content, appears at bottom */}
        {suggestionsVisible && suggestionExamples.length > 0 && (
          <div style={{ marginTop: 'auto', paddingTop: spacing[4] }}>
            {/* Suggestion label ticker */}
            <div style={{ marginBottom: spacing[3] }}>
              <Ticker
                messages={suggestionLabels}
                intervalMin={6000}
                intervalMax={10000}
                className="text-[#586e75] font-semibold uppercase tracking-wide text-xs"
              />
            </div>

            {/* Suggestion examples - 3 tickers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => {
                    const randomIndex = Math.floor(Math.random() * suggestionExamples.length);
                    if (onExampleClick) {
                      onExampleClick(suggestionExamples[randomIndex]);
                    }
                  }}
                  className="text-left hover:bg-[#002b36] hover:border-[#2aa198] transition-all"
                  style={{
                    padding: spacing[3],
                    backgroundColor: semanticColors.bg.secondary,
                    borderRadius: borderRadius.md,
                    fontSize: fontSize.sm,
                    border: `1px solid ${semanticColors.border.default}`,
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Ticker
                    messages={suggestionExamples}
                    intervalMin={10000}
                    intervalMax={15000}
                    className="text-[#93a1a1]"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

CapturePage.displayName = 'CapturePage';

export default CapturePage;
