import { memo } from 'react';
import { cn } from "@/lib/utils";
import { ChevronDown } from 'lucide-react';
import DashboardSection from "./dashboard-section";
import type { DashboardState } from '@/lib/types/dashboard';
import type { Tile } from '@/lib/types/tile';
import type { Contact } from '@/lib/types/contact';

interface DashboardContentProps {
  state: DashboardState;
  mainFocusTileComponent: React.ReactNode;
  getSectionTiles: (items: string[]) => Tile[];
  contactsRecord: Record<string, Contact>;
  onScrollToSection: (sectionId: string) => void;
}

export const DashboardContent = memo(function DashboardContent({
  state,
  mainFocusTileComponent,
  getSectionTiles,
  contactsRecord,
  onScrollToSection
}: DashboardContentProps) {
  // Don't render if still in initial loading state
  if (state.initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-2xl">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className={cn(
      "w-full max-w-md min-h-screen pt-[var(--header-height)]",
      "bg-transparent",
      "shadow-sm",
      "overflow-y-auto",
      "touch-pan-y",
      "scroll-smooth",
      "z-10"
    )}>
      {/* Content Container */}
      <div className="pb-24 w-full">
        {/* Main Focus Card */}
        <div className="px-6 pt-8">
          {mainFocusTileComponent}
          {state.isTabChanging && (
            <div 
              className="mb-6 p-8 bg-white/80 dark:bg-slate-800/80 shadow-lg rounded-xl 
                        border-2 border-slate-200/50 dark:border-slate-700/50 animate-pulse h-40"
            />
          )}
        </div>

        {/* Sections - only show during stable tab state */}
        <div className="mt-8 pt-4 border-t border-slate-700/30 w-full">
          {!state.isTabChanging && state.activeSections.map((section, sectionIndex) => {
            // Get tiles for this section using memoized function
            const sectionTiles = getSectionTiles(section.items);
            const isEvenSection = sectionIndex % 2 === 0;
            
            return (
              <DashboardSection
                key={`${state.activeTab}-section-${section.title.replace(/\s+/g, '-').toLowerCase()}`}
                section={section}
                isEvenSection={isEvenSection}
                activeTab={state.activeTab}
                sectionTiles={sectionTiles}
                contactsRecord={contactsRecord}
              />
            );
          })}
        </div>
      </div>

      {/* Next Section Preview (Fixed to bottom) - don't show during tab changes */}
      {!state.isTabChanging && state.nextSection && (
        <button
          type="button"
          className={cn(
            "fixed bottom-0 left-0 right-0 z-40 cursor-pointer",
            "max-w-md mx-auto w-full",
            "transition-all duration-300 transform",
            "translate-y-0 hover:translate-y-1",
            "border-0 outline-none focus:outline-none p-0 m-0 bg-transparent"
          )}
          onClick={() => state.nextSection && onScrollToSection(state.nextSection)}
          aria-label="Go to next section"
        >
          <div className={cn(
            "backdrop-blur-md bg-slate-800/70",
            "border-t border-slate-700/30",
            "px-4 py-2",
            "flex items-center justify-between",
            "shadow-lg shadow-slate-900/20",
            "rounded-t-lg mx-2"
          )}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-200">
                Next Section
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
        </button>
      )}
    </div>
  );
}); 