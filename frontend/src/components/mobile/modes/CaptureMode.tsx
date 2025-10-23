'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { spacing, fontSize, borderRadius, iconSize, semanticColors } from '@/lib/design-system';
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
      {/* Top Content - Scrollable - 4px grid */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto" style={{ padding: spacing[4], minHeight: '200px' }}>
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

        {/* Suggestions - sticky at bottom of scrollable area */}
        {suggestionsVisible && suggestionExamples.length > 0 && (
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              backgroundColor: semanticColors.bg.primary,
              borderTop: `1px solid ${semanticColors.border.default}`,
              paddingTop: spacing[3],
              paddingBottom: spacing[4],
              paddingLeft: spacing[4],
              paddingRight: spacing[4],
              marginLeft: `-${spacing[4]}`,
              marginRight: `-${spacing[4]}`,
              marginBottom: `-${spacing[4]}`
            }}
          >
            {/* Suggestion label ticker */}
            <div style={{ marginBottom: spacing[2] }}>
              <Ticker
                messages={suggestionLabels}
                intervalMin={6000}
                intervalMax={10000}
                className="text-[#586e75] font-semibold uppercase tracking-wide"
              />
            </div>

            {/* Suggestion examples - 3 tickers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
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
                    padding: spacing[2],
                    backgroundColor: semanticColors.bg.secondary,
                    borderRadius: borderRadius.sm,
                    fontSize: fontSize.xs,
                    border: `1px solid ${semanticColors.border.default}`,
                    minHeight: '32px',
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
