import { memo } from 'react';
import { PlusCircle, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DashboardTileCard } from "@/components/dashboard-tile-card";
import type { Section } from '@/lib/types/dashboard';
import type { Tile } from '@/lib/types/tile';
import type { Contact } from '@/lib/types/contact';
import type { Tab } from '@/lib/types/dashboard';
import { tabHeaderColors } from '@/lib/constants/dashboard';

// Map of icon names to components
const iconMap: Record<string, LucideIcon> = {
  Sparkles, 
  // Import any other icons used in iconMap in page.tsx
};

interface DashboardSectionProps {
  section: Section;
  isEvenSection: boolean;
  activeTab: Tab;
  sectionTiles: Tile[];
  contactsRecord: Record<string, Contact>;
}

const DashboardSection = memo(function DashboardSection({
  section,
  isEvenSection,
  activeTab,
  sectionTiles,
  contactsRecord
}: DashboardSectionProps) {
  const sectionId = `section-${section.title.replace(/\s+/g, '-').toLowerCase()}`;
  
  // Determine section background style based on even/odd
  const sectionClass = isEvenSection 
    ? "bg-slate-800/30 backdrop-blur-md border border-slate-700/20" 
    : "bg-slate-800/20 backdrop-blur-md border border-slate-700/10";

  // Use the icon if it exists in the map, otherwise use Sparkles
  const IconComponent = iconMap[section.icon] || Sparkles;
  
  return (
    <section 
      id={sectionId}
      className={cn(
        "mb-6 last:mb-0 w-full",
        "shadow-md shadow-slate-900/10",
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:shadow-slate-900/20",
        sectionClass
      )}
    >
      {/* Section Header */}
      <header 
        className={cn(
          "section-header-sticky",
          "px-4 py-3",
          "backdrop-blur-md bg-slate-800/40",
          "border-b border-slate-700/20",
          "transition-all duration-300"
        )}
      >
        <div className="flex items-center gap-2">
          {/* Section Icon */}
          <IconComponent className={cn(
            "h-5 w-5", 
            tabHeaderColors[activeTab],
            "transition-colors duration-500"
          )} />
          
          {/* Section Title */}
          <h3 className="text-sm font-semibold text-slate-200 hover:text-slate-100 transition-colors duration-300">
            {section.title}
          </h3>
        </div>
        
        {/* Section Description */}
        <p className="text-xs text-slate-400 hover:text-slate-300 mt-1 ml-7 transition-colors duration-300">
          {section.description}
        </p>
      </header>

      {/* Section Content */}
      <div className="px-4 py-6">
        {sectionTiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {sectionTiles.map((tile: Tile) => (
              <DashboardTileCard
                key={`${activeTab}-${tile.id}`}
                tile={tile}
                contacts={contactsRecord}
              />
            ))}
          </div>
        ) : (
          // Empty state
          <div className="p-4 text-center text-sm text-slate-400
                        bg-slate-800/30 backdrop-blur-md rounded-lg
                        border border-slate-700/20
                        shadow-md shadow-slate-900/10
                        transition-all duration-300">
            <div className="flex flex-col items-center gap-2 py-2">
              <span className="w-10 h-10 rounded-full bg-slate-700/50 
                              flex items-center justify-center
                              border border-slate-600/30">
                <PlusCircle className="h-5 w-5 text-slate-300" />
              </span>
              <p>No items available for {section.title}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-1 text-xs text-slate-300 hover:text-slate-100
                          hover:bg-slate-700/50"
              >
                Add Item
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

export default DashboardSection; 