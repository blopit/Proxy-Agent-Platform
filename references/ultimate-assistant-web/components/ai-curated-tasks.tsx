import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Award,
  Sparkles,
  Zap,
  Calendar,
  CheckSquare,
  MessageSquare,
  Heart,
  Book,
  Play,
  ExternalLink,
  AlertCircle,
  Users,
  ChevronRight,
  BarChart,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Tile } from "@/lib/types/tile";
import type { Contact } from "@/lib/types/contact";
import AppIcon from "@/components/app-icon";
import { InteractiveCard } from "@/components/ui/interactive-card";
import { Progress } from "@/components/ui/progress";

interface AICuratedTasksProps {
  tiles: Tile[];
  contacts: Record<string, Contact>;
  customTimes?: string[];
  activeTab?: string;
}

// Add this before the getActionButtons function
const actionMap: Record<string, { primary: string; secondary: string }> = {
  calendar: { primary: "Join Meeting", secondary: "Reschedule" },
  tasks: { primary: "Complete Task", secondary: "Postpone" },
  messengers: { primary: "Reply", secondary: "Mute" },
  wellness: { primary: "Start Session", secondary: "Skip" },
  health: { primary: "Start Activity", secondary: "Reschedule" },
  learn: { primary: "Start Learning", secondary: "Save for Later" },
  entertainment: { primary: "Play Now", secondary: "Add to List" },
  social: { primary: "Respond", secondary: "View Later" },
  alerts: { primary: "View Details", secondary: "Dismiss" },
  "ai-actions": { primary: "Approve", secondary: "Review" },
  travel: { primary: "View Details", secondary: "Check Status" },
  work: { primary: "View Task", secondary: "Delegate" },
};

export default function AICuratedTasks({
  tiles,
  contacts,
  customTimes,
  activeTab,
}: AICuratedTasksProps) {
  const colorMap: Record<string, string> = {
    whatsapp: "green",
    email: "blue",
    slack: "teal",
    telegram: "blue",
    messenger: "indigo",
    sms: "purple",
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

  // Get automation level icon
  const getAutomationIcon = (type: string | undefined) => {
    switch (type) {
      case "automatic":
        return (
          <Zap
            className="h-3 w-3 text-amber-500"
            aria-label="AI can handle automatically"
            data-oid="li6h4rn"
          />
        );

      case "requiresPermission":
        return (
          <Zap
            className="h-3 w-3 text-blue-500"
            aria-label="AI needs your approval"
            data-oid="hi82jh2"
          />
        );

      default:
        return null;
    }
  };

  // Filter tiles based on active tab
  const filteredTiles = tiles
    .filter((tile) => {
      if (!activeTab || activeTab === "dashboard") return true;

      switch (activeTab) {
        case "calendar":
          return tile.category === "calendar";
        case "tasks":
          return tile.category === "tasks";
        case "messages":
          return (
            tile.category === "messengers" ||
            tile.apps?.some((app) =>
              ["whatsapp", "email", "slack", "telegram", "messenger", "sms"].includes(
                app
              )
            )
          );
        case "learning":
          return tile.category === "learn";
        case "wellness":
          return tile.category === "health";
        case "entertainment":
          return tile.category === "social" || tile.category === "entertainment";
        default:
          return true;
      }
    })
    .slice(0, 3); // Limit to 3 tasks

  // Get category icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "calendar":
        return <Calendar className="h-5 w-5" data-oid="8c7niok" />;
      case "tasks":
        return <CheckSquare className="h-5 w-5" data-oid="08ckcu-" />;
      case "messengers":
      case "alerts":
        return <MessageSquare className="h-5 w-5" data-oid="7mu01w:" />;
      case "health":
        return <Heart className="h-5 w-5" data-oid="o:5eh-." />;
      case "learn":
        return <Book className="h-5 w-5" data-oid="6o6bmzw" />;
      case "social":
      case "entertainment":
        return <Play className="h-5 w-5" data-oid="9rdg7ba" />;
      default:
        return <AlertCircle className="h-5 w-5" data-oid="05khs16" />;
    }
  };

  // Get action buttons based on category
  const getActionButtons = (tile: Tile) => {
    // Ensure we always have a default set of actions
    const defaultActions = {
      primary: { label: "View Details", action: () => {} },
      secondary: { label: "Dismiss", action: () => {} },
      tertiary: { label: "Later", action: () => {} }
    };

    // If tile has actions, use them, otherwise fall back to category-based actions
    const actions = tile.actions?.length ? tile.actions : [
      { label: actionMap[tile.category]?.primary || defaultActions.primary.label },
      { label: actionMap[tile.category]?.secondary || defaultActions.secondary.label },
      { label: defaultActions.tertiary.label }
    ];

    return (
      <div className="flex gap-3 mt-4">
        {/* Primary action - always show */}
        <Button
          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
        >
          {actions[0]?.label || defaultActions.primary.label}
        </Button>
        
        {/* Secondary action - always show */}
        <Button
          className="flex-1 bg-purple-600 hover:bg-purple-700"
        >
          {actions[1]?.label || defaultActions.secondary.label}
        </Button>
        
        {/* Tertiary action - always show */}
        <Button 
          variant="outline" 
          className="flex-1"
        >
          {actions[2]?.label || defaultActions.tertiary.label}
        </Button>
      </div>
    );
  };

  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <CheckCircle2
          className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-2"
          data-oid="l1:x0on"
        />

        <h3
          className="text-base font-semibold text-slate-900 dark:text-slate-100"
          data-oid="zg871ye"
        >
          Suggestions
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredTiles.map((tile, index) => {
          const app = tile.apps[0];
          const color = colorMap[app] || "purple";
          const contact = tile.contact ? contacts[tile.contact] : null;

          // Generate time display
          const timeDisplay =
            customTimes?.[index] ||
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
                    : tile.category === "health"
                      ? "Wellness"
                      : tile.category === "learn"
                        ? "Learning"
                        : "Item";

          const mainContent = (
            <div className="flex items-start gap-4 p-3">
              <div className="shrink-0 relative" data-oid="ncm0s6b">
                <AppIcon app={app} size={28} data-oid="kw5klc-" />
                {contact && (
                  <img 
                    src={contact.avatar || "/placeholder.svg"}
                    alt={contact.name}
                    className="w-6 h-6 rounded-full absolute -bottom-2 -left-2 ring-1 ring-offset-1 ring-slate-200/50 dark:ring-slate-700/50 bg-white dark:bg-slate-800 z-10"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0" data-oid="2y49v:m">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-medium" data-oid="god6goi">
                    {tile.title}
                  </h4>
                  {tile.trending && (
                    <Sparkles
                      className="h-4 w-4 ml-1 text-amber-500 flex-shrink-0"
                      aria-label="Trending"
                      data-oid="4:tmo71"
                    />
                  )}
                </div>
                <p
                  className="text-sm text-slate-600 dark:text-slate-300 mt-2 flex items-center"
                  data-oid="rif0mb5"
                >
                  <Clock className="h-4 w-4 mr-2" data-oid="9hgr3ij" />
                  {timeDisplay}
                  {getAutomationIcon(tile.aiAutomationLevel) && (
                    <span className="ml-3" data-oid="dgsgfl:">
                      {getAutomationIcon(tile.aiAutomationLevel)}
                    </span>
                  )}
                </p>
                {contact && (
                  <div
                    className="flex items-center mt-2 text-sm text-slate-600 dark:text-slate-300"
                    data-oid=".v_ayll"
                  >
                    <span data-oid="k:p05k.">{contact.name}</span>
                  </div>
                )}
                {tile.achievementBadge && (
                  <div
                    className="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-2"
                    data-oid="exsps9o"
                  >
                    <Award className="h-4 w-4" data-oid="a8157n4" />
                    {tile.achievementBadge}
                  </div>
                )}
              </div>
              <div className="shrink-0" data-oid="65i3_cf">
                <Badge className={`${badgeColorMap[color]} px-3 py-1`} data-oid="grnc6eq">
                  {categoryDisplay}
                </Badge>
              </div>
            </div>
          );

          const expandedContent = (
            <div className="space-y-5 p-5">
              {/* Header with app icon and title */}
              <div className="flex items-start gap-6">
                <div className="shrink-0">
                  <AppIcon app={app} size={48} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      {tile.title}
                    </h3>
                    {tile.trending && (
                      <Sparkles
                        className="h-5 w-5 text-amber-500"
                        aria-label="Trending"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <Badge className={`${badgeColorMap[color]} px-3 py-1`}>
                      {categoryDisplay}
                    </Badge>
                    <span className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {timeDisplay}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="bg-white/60 dark:bg-slate-800/60 p-5 rounded-xl">
                <p className="text-base text-slate-900 dark:text-slate-100">
                  {tile.content}
                </p>

                {/* AI suggestions if available */}
                {tile.aiActionSuggestion && (
                  <div className="mt-2 p-1.5 md:mt-3 md:p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                    <p className="text-xs md:text-sm text-indigo-700 dark:text-indigo-300 flex items-center gap-1 md:gap-2">
                      <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-indigo-500" />
                      {tile.aiActionSuggestion}
                    </p>
                  </div>
                )}
              </div>

              {/* Priority and progress section */}
              <div className="grid grid-cols-2 gap-4" data-oid="ehh8u1a">
                <div
                  className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg"
                  data-oid="a_bwldg"
                >
                  <h4
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1"
                    data-oid="c4ez2hi"
                  >
                    <AlertCircle className="h-4 w-4" data-oid="73m44rb" />{" "}
                    Priority
                  </h4>
                  <div
                    className="flex items-center justify-between"
                    data-oid="ifm2fx:"
                  >
                    <span
                      className={`text-lg font-semibold ${tile.urgency > 3 ? "text-red-500" : "text-amber-500"}`}
                      data-oid="_1tl5f_"
                    >
                      {tile.urgency * (tile.importance || 1)}/25
                    </span>
                    <Badge
                      variant="outline"
                      className={`${tile.urgency > 3 ? "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400" : ""}`}
                      data-oid="avvacy5"
                    >
                      {tile.urgency > 3 ? "Urgent" : "Normal"}
                    </Badge>
                  </div>
                </div>

                <div
                  className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg"
                  data-oid="w1q-iqc"
                >
                  <h4
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1"
                    data-oid="eiloj1n"
                  >
                    <Activity className="h-4 w-4" data-oid=":trt9an" /> Status
                  </h4>
                  <div className="space-y-2" data-oid="jcm5wh2">
                    <Progress
                      value={tile.completed ? 100 : 30}
                      className="h-2"
                      data-oid="c-gzl0."
                    />

                    <span className="text-xs text-gray-500" data-oid="da7:sxj">
                      {tile.completed ? "Completed" : "In progress"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact information if available */}
              {contact && (
                <div
                  className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg"
                  data-oid="3-ioidd"
                >
                  <h4
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3"
                    data-oid="bv1n60c"
                  >
                    Contact
                  </h4>
                  <div className="flex items-center gap-3" data-oid="p0m2.0j">
                    <Avatar className="h-10 w-10" data-oid="ni_-xqh">
                      <img
                        src={contact.avatar || "/placeholder.svg"}
                        alt={contact.name}
                        data-oid="60f3ke4"
                      />
                    </Avatar>
                    <div data-oid="71-th-6">
                      <p className="font-medium" data-oid="wpw_xvz">
                        {contact.name}
                      </p>
                      <div className="flex gap-2 mt-1" data-oid="l9a4tx:">
                        {tile.apps.map((contactApp) => (
                          <AppIcon
                            key={`app-${contactApp}`}
                            app={contactApp}
                            size={16}
                            data-oid="hd:pen3"
                          />
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      data-oid="4lcx-sr"
                    >
                      Contact{" "}
                      <ChevronRight
                        className="h-3 w-3 ml-1"
                        data-oid="igz7l-t"
                      />
                    </Button>
                  </div>
                </div>
              )}

              {/* Related events if available */}
              {tile.relatedEvents && tile.relatedEvents.length > 0 && (
                <div
                  className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg"
                  data-oid="zh.e7lf"
                >
                  <h4
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"
                    data-oid=":atl46p"
                  >
                    Related Events
                  </h4>
                  <div className="space-y-2" data-oid="z0knpok">
                    {tile.relatedEvents.map((event) => (
                      <div
                        key={`event-${event.type}-${event.app}-${event.timestamp || ""}`}
                        className="flex items-center gap-2 text-sm p-2 bg-white/70 dark:bg-slate-700/50 rounded-md"
                        data-oid="s6f-sba"
                      >
                        <AppIcon app={event.app} size={16} data-oid="a5agxma" />
                        <span data-oid="of0.qwo">{event.content}</span>
                        {event.timestamp && (
                          <span
                            className="text-xs text-gray-500 ml-auto flex items-center gap-1"
                            data-oid="_f70on-"
                          >
                            <Clock className="h-3 w-3" data-oid="5ncu:8y" />
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
              )}

              {/* Achievement badge if available */}
              {tile.achievementBadge && (
                <div
                  className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800/30"
                  data-oid="850bvey"
                >
                  <div className="flex items-center gap-3" data-oid="p_lyxiw">
                    <div
                      className="bg-amber-100 dark:bg-amber-800/50 p-2 rounded-full"
                      data-oid="5r:4c1a"
                    >
                      <Award
                        className="h-5 w-5 text-amber-600 dark:text-amber-400"
                        data-oid="guex3-i"
                      />
                    </div>
                    <div data-oid="v1nmogp">
                      <h4
                        className="font-medium text-amber-700 dark:text-amber-300"
                        data-oid="p7wsd5i"
                      >
                        Achievement
                      </h4>
                      <p
                        className="text-sm text-amber-600 dark:text-amber-400"
                        data-oid="5l0qz8s"
                      >
                        {tile.achievementBadge}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {getActionButtons(tile)}

              {/* AI automation level if available */}
              {tile.aiAutomationLevel && (
                <div
                  className="text-center text-xs text-gray-500 flex items-center justify-center gap-1 mt-2"
                  data-oid="7l4c8gh"
                >
                  {getAutomationIcon(tile.aiAutomationLevel)}
                  {tile.aiAutomationLevel === "automatic"
                    ? "AI can handle this automatically"
                    : tile.aiAutomationLevel === "requiresPermission"
                      ? "AI needs your permission to proceed"
                      : "Manual action required"}
                </div>
              )}
            </div>
          );

          return (
            <InteractiveCard
              key={`curated-${tile.id}`}
              color={color}
              isTrending={tile.trending}
              expandedContent={expandedContent}
              className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-lg rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200"
              dropShadowIntensity="medium"
              data-oid="5ontj74"
            >
              {mainContent}
            </InteractiveCard>
          );
        })}
      </div>
    </div>
  );
}
