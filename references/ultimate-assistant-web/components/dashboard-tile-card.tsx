"use client";

import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  CalendarClock, 
  Sparkles, 
  Mail, 
  MessageCircle, 
  Hash, 
  CheckSquare, 
  Cloud, 
  Bell, 
  Video, 
  Activity,
  Kanban, 
  Github, 
  GraduationCap, 
  MapPin, 
  Users,
  Sunrise,
  Heart,
  Music,
  Gamepad,
  HelpCircle,
  AlertCircle,
  type LucideIcon
} from "lucide-react";
import type { Tile } from "@/lib/types/tile";
import type { Contact } from "@/lib/types/contact";
import { InteractiveCard, Layer } from "@/components/ui/interactive-card";
import { Avatar } from "@/components/ui/avatar";
import StackedAvatars from "@/components/stacked-avatars";

// Define Z-layers for consistent depth
const Z_LAYERS = {
  BASE: 0,
  FLOAT: 5,
  HIGHLIGHT: -10,
  PRIMARY: -15,
  SECONDARY: -20,
  BACKGROUND: -25
};

const CATEGORY_TO_ICON: Record<string, LucideIcon> = {
  calendar: CalendarClock,
  email: Mail,
  whatsapp: MessageCircle,
  slack: Hash,
  task: CheckSquare,
  weather: Cloud,
  notification: Bell,
  zoom: Video,
  fitbit: Activity,
  jira: Kanban,
  github: Github,
  coursera: GraduationCap,
  localEvents: MapPin,
  social: Users,
  meditation: Sunrise,
  health: Heart,
  music: Music,
  game: Gamepad,
  learn: GraduationCap,
  default: HelpCircle,
  alert: AlertCircle
};

interface DashboardTileCardProps {
  tile: Tile;
  contacts: Record<string, Contact>;
}

function DashboardTileCardComponent({ tile, contacts }: DashboardTileCardProps) {
  // Determine color based on app - memoize this
  const app = useMemo(() => tile.apps?.[0] || "default", [tile.apps]);
  
  const color = useMemo(() => {
    const colorMap: Record<string, string> = {
      calendar: "purple",
      email: "blue",
      whatsapp: "green",
      slack: "teal",
      task: "indigo",
      weather: "cyan",
      notification: "red",
      zoom: "blue",
      fitbit: "cyan",
      jira: "indigo",
      github: "gray",
      coursera: "blue",
      localEvents: "orange",
      social: "pink",
      default: "purple"
    };
    return colorMap[app] || "purple";
  }, [app]);

  // Button color mapping - memoize this
  const buttonColor = useMemo(() => {
    const buttonColorMap: Record<string, string> = {
      purple: "bg-purple-600 hover:bg-purple-700",
      blue: "bg-blue-600 hover:bg-blue-700",
      green: "bg-green-600 hover:bg-green-700",
      teal: "bg-teal-600 hover:bg-teal-700",
      indigo: "bg-indigo-600 hover:bg-indigo-700",
      cyan: "bg-cyan-600 hover:bg-cyan-700",
      red: "bg-red-600 hover:bg-red-700",
      orange: "bg-orange-600 hover:bg-orange-700",
      pink: "bg-pink-600 hover:bg-pink-700",
      gray: "bg-gray-600 hover:bg-gray-700",
    };
    return buttonColorMap[color];
  }, [color]);

  // Badge color mapping - memoize this
  const badgeColor = useMemo(() => {
    const badgeColorMap: Record<string, string> = {
      purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      teal: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
      indigo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
      cyan: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
      red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      orange: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      pink: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      gray: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    };
    return badgeColorMap[color];
  }, [color]);

  // Get hover intensity based on importance - memoize this
  const hoverIntensity = useMemo((): "light" | "medium" | "heavy" => {
    const priority = (tile.urgency || 1) * (tile.importance || 1);
    if (priority > 15) return "heavy";
    if (priority > 8) return "medium";
    return "light";
  }, [tile.urgency, tile.importance]);

  // Format timestamp - memoize this
  const timeDisplay = useMemo(() => {
    if (!tile.timestamp) return 'No time specified';
    
    if (tile.timestamp instanceof Date) {
      return tile.timestamp.toLocaleTimeString();
    }
    
    return new Date(tile.timestamp).toLocaleTimeString();
  }, [tile.timestamp]);

  // Memoize the icon component for the card
  const iconComponent = useMemo(() => {
    const category = tile.category?.toLowerCase() || app.toLowerCase();
    const IconComponent = CATEGORY_TO_ICON[category] || CATEGORY_TO_ICON.default;
    return <IconComponent className="h-4 w-4 mr-1" />;
  }, [tile.category, app]);

  // Memoize the content to avoid unnecessary rerenders
  const mainContent = useMemo(() => (
    <>
      {/* Background decorative layer */}
      <Layer preset="BACKGROUND" shadow="light" className="pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/20 dark:to-black/10 rounded-xl" />
      </Layer>

      {/* Main content layer */}
      <Layer preset="PRIMARY" shadow="light">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              {/* Show contact avatar if tile has a contact */}
              {tile.contact && contacts[tile.contact] && (
                <Avatar className="h-6 w-6 mr-2 ring-2 ring-white/30 dark:ring-black/30">
                  <img
                    src={contacts[tile.contact].avatar || "/placeholder.svg"}
                    alt={contacts[tile.contact].name}
                  />
                </Avatar>
              )}
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {tile.title}
              </h2>
              {tile.trending && (
                <Sparkles className="h-4 w-4 ml-2 text-amber-500" aria-label="Trending" />
              )}
            </div>
            <Badge className={badgeColor}>
              {iconComponent}
              {tile.category}
            </Badge>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {tile.content}
          </p>

          {/* Show attendees for calendar events */}
          {tile.category === "calendar" && 
            tile.details && 
            ((details) => {
              const attendees = details.attendees || [];
              return Array.isArray(attendees) && attendees.length > 0 ? (
                <div className="mt-2">
                  <StackedAvatars 
                    contacts={contacts}
                    attendeeIds={attendees}
                    size="sm"
                    limit={3}
                    showNames={true}
                  />
                </div>
              ) : null;
            })(tile.details)
          }

          <div className="flex justify-between items-center">
            <div className="flex items-center text-xs text-slate-500">
              <CalendarClock className="h-3 w-3 mr-1" />
              {timeDisplay}
            </div>

            <div className="flex space-x-2">
              {tile.actions && tile.actions.length > 0 ? (
                <Button
                  variant="default"
                  className={cn("text-white", buttonColor)}
                >
                  {tile.actions[0].label}
                </Button>
              ) : (
                <Button
                  variant="default"
                  className={cn("text-white", buttonColor)}
                >
                  View
                </Button>
              )}
            </div>
          </div>
        </div>
      </Layer>

      {/* AI suggestion layer */}
      {tile.aiActionSuggestion && (
        <Layer preset="FLOAT" shadow="light">
          <div className="mx-4 mb-3 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-md">
            <p className="text-xs text-indigo-700 dark:text-indigo-300">
              {tile.aiActionSuggestion}
            </p>
          </div>
        </Layer>
      )}
    </>
  ), [
    tile.contact, tile.title, tile.trending, tile.category, 
    tile.content, tile.details, tile.actions, tile.aiActionSuggestion,
    contacts, badgeColor, buttonColor, timeDisplay, iconComponent
  ]);

  // Memoize the card class based on the tile's properties
  const cardClassName = useMemo(() => 
    cn("h-full", {
      "bg-white/85 dark:bg-slate-900/85": true,
      "backdrop-blur-[8px]": true,
      "rounded-xl shadow-sm": true,
      "transition-all duration-200 ease-in-out": true,
      "hover:shadow-md": true,
      "border border-slate-200/50 dark:border-slate-700/50": true,
      "col-span-1": tile.size === "1",
      "col-span-2": tile.size === "2",
      "col-span-3": tile.size === "3",
      "row-span-1": tile.size === "1",
      "row-span-2": tile.size === "2",
    }),
  [tile.size]);

  return (
    <InteractiveCard
      color={color}
      isTrending={tile.trending}
      hoverScale={1.02}
      dropShadowIntensity={hoverIntensity}
      enhanced3D={true}
      layerMovement={0.8}
      portalDepth={5}
      perspective={1800}
      hoverTilt={true}
      maxDragDistance={20}
      insetMode={true}
      className={cardClassName}
    >
      {mainContent}
    </InteractiveCard>
  );
}

export const DashboardTileCard = memo(DashboardTileCardComponent);
