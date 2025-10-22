"use client";

import { useState } from "react";
import {
  Calendar,
  CheckSquare,
  MessageSquare,
  Heart,
  Book,
  Play,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardTabs } from "@/lib/data";
import { useIsMobile } from "@/hooks/use-mobile";

interface TabNavigationProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

const tabIcons = {
  dashboard: Home,
  tasks: CheckSquare,
  calendar: Calendar,
  messages: MessageSquare,
  learning: Book,
  wellness: Heart,
  entertainment: Play,
} as const;

const tabColors = {
  dashboard: "text-gray-600 dark:text-gray-400",
  tasks: "text-emerald-600 dark:text-emerald-400",
  calendar: "text-sky-600 dark:text-sky-400",
  messages: "text-green-600 dark:text-green-400",
  learning: "text-amber-600 dark:text-amber-400",
  wellness: "text-rose-600 dark:text-rose-400",
  entertainment: "text-indigo-600 dark:text-indigo-400",
} as const;

const tabNameToId = {
  "Dashboard": "dashboard",
  "Community": "tasks",
  "Calendar": "calendar",
  "Messages": "messages",
  "Learning": "learning",
  "Wellness": "wellness",
  "Entertainment": "entertainment",
} as const;

export default function TabNavigation({
  activeTab = "tasks",
  onTabChange,
}: TabNavigationProps) {
  const isMobile = useIsMobile();

  const handleTabClick = (tabKey: string) => {
    if (isMobile) {
      // Using multiple scroll methods for cross-browser/device compatibility
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    }
    onTabChange?.(tabKey);
  };

  if (!dashboardTabs || !Array.isArray(dashboardTabs) || dashboardTabs.length === 0) {
    console.error('dashboardTabs is not properly defined:', dashboardTabs);
    return <div className="p-4 text-red-500">Error loading tabs</div>;
  }
  
  return (
    <div className="flex overflow-x-auto">
      {dashboardTabs.map((tab) => {
        const tabKey = tabNameToId[tab.tabName as keyof typeof tabNameToId] || tab.tabName.toLowerCase();
        const IconComponent = tabIcons[tabKey as keyof typeof tabIcons];
        const tabColor = tabColors[tabKey as keyof typeof tabColors];

        if (!IconComponent || !tabColor) {
          console.warn(`Tab "${tab.tabName}" (id: ${tabKey}) has no icon or color defined`);
          return null;
        }

        const isActive = activeTab === tabKey;

        return (
          <button
            key={tabKey}
            type="button"
            onClick={() => handleTabClick(tabKey)}
            className={cn(
              "flex items-center gap-2 px-4 py-4 relative transition-all duration-300",
              "hover:bg-indigo-50 dark:hover:bg-indigo-900/30",
              isActive
                ? "text-foreground bg-indigo-50 dark:bg-indigo-900/20 flex-1"
                : "text-muted-foreground hover:text-foreground w-14",
            )}
          >
            <div className={cn(
              "flex items-center gap-2",
              isActive ? "w-full justify-start" : "w-full justify-center"
            )}>
              <IconComponent
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? tabColor : "text-muted-foreground"
                )}
              />
              <span 
                className={cn(
                  "font-medium whitespace-nowrap transition-all duration-300",
                  isActive 
                    ? "opacity-100 translate-x-0" 
                    : "opacity-0 -translate-x-4 hidden"
                )}
              >
                {tab.tabName}
              </span>
              {isActive && tab.sections.length > 0 && (
                <span
                  className={cn(
                    "ml-1.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium",
                    `${tabColor} bg-primary/10`
                  )}
                >
                  {tab.sections.length}
                </span>
              )}
            </div>
            {isActive && (
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-1",
                  tabColor
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
