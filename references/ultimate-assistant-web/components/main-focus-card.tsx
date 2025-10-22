import {
  CalendarClock,
  ArrowRight,
  Sparkles,
  Award,
  Zap,
  Calendar,
  CheckSquare,
  MessageSquare,
  Heart,
  Book,
  Play,
  ExternalLink,
  Clock,
  AlertCircle,
  Users,
  ChevronRight,
  BarChart,
  Activity,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Tile } from "@/lib/types/tile";
import type { Contact } from "@/lib/types/contact";
import AppIcon from "@/components/app-icon";
import { InteractiveCard, Layer, Layers, SurfaceContent, Z_LAYERS as DefaultZLayers } from "@/components/ui/interactive-card";
import { Progress } from "@/components/ui/progress";
import StackedAvatars from "@/components/stacked-avatars";

// Define smaller Z_LAYERS values for reduced depth effect
const Z_LAYERS = {
  BASE: 0,            // Card base
  FLOAT: 5,           // Closest floating elements (least deep) - reduced from 10
  HIGHLIGHT: -10,     // Highlighted elements - reduced from -20
  PRIMARY: -15,       // Primary content, main text - reduced from -30  
  SECONDARY: -20,     // Secondary content - reduced from -50
  BACKGROUND: -25     // Deepest background elements - reduced from -70
};

// Define calendar details interface with optional fields
interface CalendarTileDetails {
  location?: string;
  duration?: string;
  attendees?: string[];
  agenda?: string[];
  previousMeetingNotes?: string;
  [key: string]: unknown; // Add index signature for Record<string, unknown> compatibility
}

interface MainFocusCardProps {
  tile?: Tile | null;
  contacts: Record<string, Contact>;
  customTime?: string;
  isLoading?: boolean;
}

export default function MainFocusCard({
  tile,
  contacts,
  customTime,
  isLoading = false,
}: MainFocusCardProps) {
  if (isLoading) {
    return (
      <div 
        className={cn(
          "mb-6 p-6",
          "scale-[1.02]",
          "bg-white/80 dark:bg-slate-800/80",
          "shadow-lg rounded-xl",
          "border-2 border-slate-200/50 dark:border-slate-700/50",
          "animate-pulse"
        )}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (!tile) {
    return null;
  }

  // Determine the color based on the app
  const app = tile.apps[0];
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
  };

  const color = colorMap[app] || "purple";

  const borderColorMap: Record<string, string> = {
    purple: "border-purple-200 dark:border-purple-800/50",
    blue: "border-blue-200 dark:border-blue-800/50",
    green: "border-green-200 dark:border-green-800/50",
    teal: "border-teal-200 dark:border-teal-800/50",
    indigo: "border-indigo-200 dark:border-indigo-800/50",
    red: "border-red-200 dark:border-red-800/50",
    orange: "border-orange-200 dark:border-orange-800/50",
    yellow: "border-yellow-200 dark:border-yellow-800/50",
    cyan: "border-cyan-200 dark:border-cyan-800/50",
    violet: "border-violet-200 dark:border-violet-800/50",
    pink: "border-pink-200 dark:border-pink-800/50",
    gray: "border-gray-200 dark:border-gray-800/50",
  };

  const buttonColorMap: Record<string, string> = {
    purple:
      "bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700",
    blue: "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
    green:
      "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700",
    teal: "bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700",
    indigo:
      "bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700",
    red: "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
    orange:
      "bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700",
    yellow:
      "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700",
    cyan: "bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700",
    violet:
      "bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700",
    pink: "bg-pink-500 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700",
    gray: "bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700",
  };

  const badgeColorMap: Record<string, string> = {
    purple:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    green:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    teal: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
    indigo:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    orange:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    yellow:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    cyan: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    violet:
      "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
    pink: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  };

  // Get contact if available
  const contact = tile.contact ? contacts[tile.contact] : null;

  // Generate time display
  const timeDisplay =
    customTime ||
    (tile.category === "calendar"
      ? "Today at 3:00 PM"
      : tile.category === "tasks"
        ? "Due today at 5:00 PM"
        : tile.category === "messengers"
          ? "Received 30 minutes ago"
          : "Priority item");

  // Generate category display
  const categoryDisplay =
    tile.category === "calendar"
      ? "Calendar"
      : tile.category === "tasks"
        ? "Task"
        : tile.category === "messengers"
          ? app.charAt(0).toUpperCase() + app.slice(1)
          : tile.category === "alerts"
            ? "Alert"
            : tile.category === "community"
              ? "Community"
              : "Learning";

  // Get automation level icon
  const getAutomationIcon = () => {
    switch (tile.aiAutomationLevel) {
      case "automatic":
        return (
          <Zap
            className="h-3 w-3 text-amber-500"
            aria-label="AI can handle automatically"
          />
        );

      case "requiresPermission":
        return (
          <Zap
            className="h-3 w-3 text-blue-500"
            aria-label="AI needs your approval"
          />
        );

      default:
        return null;
    }
  };

  // Create a layered version of the main content using Z_LAYERS
  const mainContent = (
    <>
      {/* Background decorative layer */}
      <Layer preset="BACKGROUND" shadow="light" className="pointer-events-none" depth={0.5}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/20 dark:to-black/10 rounded-xl" />
      </Layer>
      
      {/* Header section with title and badge (HIGHLIGHT LAYER) */}
      <Layer preset="HIGHLIGHT" shadow="light" depth={0.7}>
        <div className="flex justify-between items-start mb-8 px-8 pt-8"> {/* Increased padding and margins */}
          <div className="flex items-center">
            {contact && (
              <Avatar className="h-6 w-6 mr-2 ring-2 ring-white/30 dark:ring-black/30">
                <img
                  src={contact.avatar || "/placeholder.svg"}
                  alt={contact.name}
                />
              </Avatar>
            )}
            <div className="flex items-center">
              <h2
                className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2"
              >
                {tile.trending && (
                  <TrendingUp
                    className="h-4 w-4 text-amber-500 flex-shrink-0"
                    aria-label="Trending"
                  />
                )}
                {tile.title}
              </h2>
            </div>
          </div>
          <div className="flex items-center">
            <Badge className={badgeColorMap[color]}>
              <AppIcon
                app={app}
                className="mr-1 text-current"
                size={14}
              />
              {categoryDisplay}
            </Badge>
          </div>
        </div>
      </Layer>
      
      {/* Content section (PRIMARY LAYER) */}
      <Layer preset="PRIMARY" shadow="light" depth={0.6}>
        <div className="px-8 mb-8"> {/* Increased padding and margin */}
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {tile.content}
          </p>
          
          {/* Show attendees for calendar meetings */}
          {tile.category === "calendar" && 
            tile.details && 
            ((details) => {
              const attendees = (details as CalendarTileDetails).attendees || [];
              return Array.isArray(attendees) && attendees.length > 0 ? (
                <div className="mt-6"> {/* Increased margin */}
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
        </div>
      </Layer>
      
      {/* Footer section with time and button (SECONDARY LAYER) */}
      <Layer preset="SECONDARY" shadow="light" depth={0.4}>
        <div className="flex justify-between items-center px-8 pb-8 mt-6"> {/* Increased padding and margins */}
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-500">
            <CalendarClock className="h-3 w-3 mr-1" />
            {timeDisplay}
            {getAutomationIcon() && (
              <div className="ml-2">
                {getAutomationIcon()}
              </div>
            )}
          </div>
        </div>
      </Layer>
      
      {/* Button placed directly on card surface */}
      <SurfaceContent position="bottom-right" offset={12}>
        <Button
          variant="default"
          size="sm"
          className={cn(
            "text-white",
            buttonColorMap[color],
            "flex items-center gap-2"
          )}
          style={{
            transform: 'translateZ(0)', 
            transformStyle: 'flat',
            boxShadow: 'none'
          }}
        >
          View
          <ArrowRight className="h-3 w-3" />
        </Button>
      </SurfaceContent>
    </>
  );

  // Enhanced layered version of expanded content
  const expandedContent = (
    <div className="space-y-4">
      {/* Header section */}
      <Layers 
        start={Z_LAYERS.HIGHLIGHT} 
        end={Z_LAYERS.FLOAT} 
        shadow="light" 
        depthMultiplier={0.5} 
        varyDepth={true}
      >
        {/* App icon */}
        <div className="shrink-0 flex items-start gap-3">
          <div className="p-2 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-sm">
            <AppIcon app={app} size={40} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold flex items-center gap-2 overflow-visible">
                {tile.trending && (
                  <TrendingUp
                    className="h-4 w-4 text-amber-500 flex-shrink-0"
                    aria-label="Trending"
                  />
                )}
                {tile.title}
              </h3>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <Badge className={badgeColorMap[color]}>
                {categoryDisplay}
              </Badge>
              <span
                className="text-sm text-gray-500 flex items-center gap-1"
              >
                <CalendarClock className="h-3 w-3" />
                {timeDisplay}
              </span>
            </div>
          </div>
        </div>
        
        {/* Main content box */}
        <div
          className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg mt-2 border border-slate-200/50 dark:border-slate-700/50"
        >
          <p className="text-base">
            {tile.content}
          </p>

          {/* AI suggestions if available */}
          {tile.aiActionSuggestion && (
            <div
              className="mt-2 p-1.5 md:mt-4 md:p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-md border border-indigo-100 dark:border-indigo-800/30"
            >
              <p
                className="text-xs md:text-sm text-indigo-700 dark:text-indigo-300 flex items-center gap-1 md:gap-2"
              >
                <Sparkles
                  className="h-3 w-3 md:h-4 md:w-4 text-indigo-500"
                />{" "}
                {tile.aiActionSuggestion}
              </p>
            </div>
          )}
        </div>
      </Layers>

      {/* Priority and progress section */}
      <Layer preset="PRIMARY" shadow="light" depth={0.6}>
        <div className="grid grid-cols-2 gap-4">
          <div
            className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/50 dark:border-slate-700/50"
          >
            <h4
              className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1"
            >
              <AlertCircle className="h-4 w-4" /> Priority
            </h4>
            <div className="flex items-center justify-between">
              <span
                className={`text-lg font-semibold ${tile.urgency > 3 ? "text-red-500" : "text-amber-500"}`}
              >
                {tile.urgency * tile.importance}/25
              </span>
              <Badge
                variant="outline"
                className={`${tile.urgency > 3 ? "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400" : ""}`}
              >
                {tile.urgency > 3 ? "Urgent" : "Normal"}
              </Badge>
            </div>
          </div>

          <div
            className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/50 dark:border-slate-700/50"
          >
            <h4
              className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1"
            >
              <Activity className="h-4 w-4" /> Status
            </h4>
            <div className="space-y-2">
              <Progress
                value={tile.completed ? 100 : 30}
                className="h-2"
              />

              <span className="text-xs text-gray-500">
                {tile.completed ? "Completed" : "In progress"}
              </span>
            </div>
          </div>
        </div>
      </Layer>

      {/* Additional sections with Layer components */}
      {/* Show attendees section for calendar meetings with multiple attendees */}
      {tile.category === "calendar" && 
        tile.details && 
        ((details) => {
          const attendees = (details as CalendarTileDetails).attendees || [];
          return Array.isArray(attendees) && attendees.length > 1 ? (
            <Layer preset="SECONDARY" shadow="light" depth={0.5}>
              <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  <Users className="h-4 w-4 inline mr-2" />
                  Attendees
                </h4>
                <div className="space-y-2">
                  <StackedAvatars 
                    contacts={contacts}
                    attendeeIds={attendees}
                    size="md"
                    limit={5}
                    showNames={true}
                  />
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {attendees.map((attendeeId: string) => {
                      const attendee = contacts[attendeeId];
                      if (!attendee) return null;
                      
                      return (
                        <div 
                          key={attendeeId}
                          className="flex items-center gap-2 bg-white/70 dark:bg-slate-700/50 p-2 rounded-md"
                        >
                          <Avatar className="h-6 w-6">
                            <img
                              src={attendee.avatar || "/placeholder.svg"}
                              alt={attendee.name}
                            />
                          </Avatar>
                          <span className="text-sm">{attendee.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Layer>
          ) : null;
        })(tile.details)
      }

      {/* Contact information if available */}
      {contact && (
        <Layer preset="SECONDARY" shadow="light" depth={0.5}>
          <div
            className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200/50 dark:border-slate-700/50"
          >
            <h4
              className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3"
            >
              <Users className="h-4 w-4 inline mr-2" />
              Contact
            </h4>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-1 ring-offset-1 ring-slate-200/50 dark:ring-slate-700/50">
                <img
                  src={contact.avatar || "/placeholder.svg"}
                  alt={contact.name}
                />
              </Avatar>
              <div>
                <p className="font-medium">
                  {contact.name}
                </p>
                <div className="flex gap-2 mt-1">
                  {tile.apps.map((contactApp) => (
                    <AppIcon
                      key={`app-${contactApp}`}
                      app={contactApp}
                      size={16}
                    />
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
              >
                Contact{" "}
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </Layer>
      )}

      {/* Related events if available */}
      {tile.relatedEvents && tile.relatedEvents.length > 0 && (
        <Layer preset="BACKGROUND" shadow="light" depth={0.3}>
          <div
            className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200/50 dark:border-slate-700/50"
          >
            <h4
              className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
            >
              <Clock className="h-4 w-4 inline mr-2" />
              Related Events
            </h4>
            <div className="space-y-2">
              {tile.relatedEvents.map((event) => (
                <div
                  key={`event-${event.type}-${event.app}-${event.timestamp || ""}`}
                  className="flex items-center gap-2 text-sm p-2 bg-white/70 dark:bg-slate-700/50 rounded-md"
                >
                  <AppIcon app={event.app} size={16} />
                  <span>{event.content}</span>
                  {event.timestamp && (
                    <span
                      className="text-xs text-gray-500 ml-auto flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3" />
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Layer>
      )}

      {/* Achievement badge if available */}
      {tile.achievementBadge && (
        <Layer preset="FLOAT" shadow="light" depth={0.3}>
          <div
            className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800/30"
          >
            <div className="flex items-center gap-3">
              <div
                className="bg-amber-100 dark:bg-amber-800/50 p-2 rounded-full"
              >
                <Award
                  className="h-5 w-5 text-amber-600 dark:text-amber-400"
                />
              </div>
              <div>
                <h4
                  className="font-medium text-amber-700 dark:text-amber-300"
                >
                  Achievement
                </h4>
                <p
                  className="text-sm text-amber-600 dark:text-amber-400"
                >
                  {tile.achievementBadge}
                </p>
              </div>
            </div>
          </div>
        </Layer>
      )}

      {/* AI automation level if available */}
      {tile.aiAutomationLevel && (
        <Layer preset="SECONDARY" shadow="light" depth={0.3} className="mt-2">
          <div
            className="text-center text-xs text-gray-500 flex items-center justify-center gap-1"
          >
            {getAutomationIcon()}
            {tile.aiAutomationLevel === "automatic"
              ? "AI can handle this automatically"
              : tile.aiAutomationLevel === "requiresPermission"
                ? "AI needs your permission to proceed"
                : "Manual action required"}
          </div>
        </Layer>
      )}

      {/* Action buttons */}
      <SurfaceContent position="bottom-right" offset={0}>
        <div className="flex gap-3 mt-4 w-full shadow-sm">
          {/* Use the actions from the tile if available */}
          {tile.actions && tile.actions.length > 0 ? (
            <>
              {/* Primary action - opens the app */}
              {tile.actions[0] && (
                <Button
                  className={cn("flex-1 text-white", buttonColorMap[color])}
                  size="sm"
                >
                  {tile.actions[0].label}
                </Button>
              )}

              {/* Secondary action - AI automation */}
              {tile.actions[1] && (
                <Button
                  className="flex-1 text-white bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  {tile.actions[1].label}
                </Button>
              )}

              {/* Tertiary action - defer/dismiss */}
              {tile.actions[2] && (
                <Button variant="outline" className="flex-1" size="sm">
                  {tile.actions[2].label}
                </Button>
              )}
            </>
          ) : (
            <>
              {/* Fallback to hardcoded buttons if no actions are available */}
              <Button
                className={cn("flex-1 text-white", buttonColorMap[color])}
                size="sm"
              >
                {tile.category === "calendar"
                  ? "Join Meeting"
                  : tile.category === "tasks"
                    ? "Complete Task"
                    : tile.category === "messengers"
                      ? "Reply"
                      : tile.category === "alerts"
                        ? "View Alert"
                        : "Take Action"}
              </Button>
              <Button variant="outline" className="flex-1" size="sm">
                {tile.category === "calendar"
                  ? "Reschedule"
                  : tile.category === "tasks"
                    ? "Snooze"
                    : tile.category === "messengers"
                      ? "Mark Read"
                      : tile.category === "alerts"
                        ? "Dismiss"
                        : "Dismiss"}
              </Button>
            </>
          )}
        </div>
      </SurfaceContent>
    </div>
  );

  // Create peek content with additional details
  const peekContent = tile && (
    <div className="absolute inset-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg">
      {/* Show additional details based on tile type */}
      {tile.category === "calendar" && tile.details && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Meeting Details
          </h4>
          {(tile.details as CalendarTileDetails).location && (
            <p className="text-sm text-gray-500">
              📍 {(tile.details as CalendarTileDetails).location}
            </p>
          )}
          {(tile.details as CalendarTileDetails).agenda && (
            <div className="text-sm text-gray-500">
              📝 Agenda Items:
              <ul className="list-disc list-inside">
                {(tile.details as CalendarTileDetails).agenda?.map((item, i) => (
                  <li key={`agenda-item-${item.slice(0, 10).replace(/\s+/g, '-')}-${i}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="mb-4 mt-4">
      <InteractiveCard
        color={color}
        isTrending={tile.trending}
        expandedContent={expandedContent}
        dropShadowIntensity="light"
        enhanced3D={true}
        layerMovement={0.8}
        portalDepth={10}
        perspective={1800}
        hoverScale={1.01}
        hoverTilt={true}
        maxDragDistance={30}
        insetMode={true}
        peekContent={peekContent}
        peekThreshold={8}
        maxPeekOffset={40}
      >
        {mainContent}
      </InteractiveCard>
    </div>
  );
}
