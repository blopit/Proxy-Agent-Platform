"use client";

import { useState, useEffect } from "react";
import { X, Award, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Tile } from "@/lib/data";
import AppIcon from "@/components/app-icon";
import { InteractiveCard } from "@/components/ui/interactive-card";
import { motion } from "framer-motion";
import { appColors, appIcons } from "@/lib/data";

interface BubbleViewProps {
  activeTab: string;
  onClose: () => void;
  tiles: Tile[];
  contacts: Record<
    string,
    {
      name: string;
      avatar?: string;
    }
  >;
}

interface BubbleItem {
  id: string;
  title: string;
  content: string;
  category: string;
  color: string;
  icon: JSX.Element;
  size: number;
  contact?: string;
  app: string;
  urgency: number;
  importance: number;
  trending?: boolean;
  achievementBadge?: string | null;
  aiAutomationLevel?: string;
  position: {
    top: string;
    left: string;
  };
}

export default function BubbleView({
  activeTab,
  onClose,
  tiles,
  contacts,
}: BubbleViewProps) {
  const [bubbles, setBubbles] = useState<BubbleItem[]>([]);
  const [expandedBubble, setExpandedBubble] = useState<string | null>(null);

  useEffect(() => {
    let filteredTiles = tiles.filter((tile) => {
      // Filter based on active tab
      if (activeTab === "calendar") return tile.category === "calendar";
      if (activeTab === "tasks") return tile.category === "tasks";
      if (activeTab === "messages")
        return (
          tile.category === "messengers" ||
          tile.category === "alerts" ||
          tile.category === "social"
        );

      if (activeTab === "learn") return tile.category === "learn";
      return false;
    });

    // Sort by priority
    filteredTiles.sort((a, b) => {
      const priorityA = a.urgency * a.importance;
      const priorityB = b.urgency * b.importance;
      return priorityB - priorityA;
    });

    // Limit to 5 bubbles for performance
    filteredTiles = filteredTiles.slice(0, 5);

    // Map to bubble items with fixed positions
    const newBubbles = filteredTiles.map((tile, index) => {
      const app = tile.apps[0];
      const size = calculateBubbleSize(tile.urgency, tile.importance);
      return {
        id: tile.id,
        title: tile.title,
        content: tile.content,
        category: tile.category,
        color: appColors[app] || "purple",
        icon: getAppIcon(app),
        size,
        contact: tile.contact,
        app,
        urgency: tile.urgency,
        importance: tile.importance,
        trending: tile.trending,
        achievementBadge: tile.achievementBadge,
        aiAutomationLevel: tile.aiAutomationLevel,
        position: positions[index], // Assign fixed position
      };
    });

    setBubbles(newBubbles);
  }, [activeTab, tiles]);

  const colorMap = appColors;

  const handleBubbleClick = (id: string) => {
    if (expandedBubble === id) {
      setExpandedBubble(null);
    } else {
      setExpandedBubble(id);
    }
  };

  // Get automation level icon
  const getAutomationIcon = (automationLevel?: string) => {
    switch (automationLevel) {
      case "automatic":
        return (
          <Zap
            className="inline-block h-3 w-3 text-amber-500 ml-1"
            aria-label="AI can handle automatically"
            data-oid="utmmdtz"
          />
        );

      case "requiresPermission":
        return (
          <Zap
            className="inline-block h-3 w-3 text-blue-500 ml-1"
            aria-label="AI needs your approval"
            data-oid="hi:zecq"
          />
        );

      default:
        return null;
    }
  };

  // Use the appIcons mapping for dynamic icons
  const getAppIcon = (app: string) => {
    const iconName = appIcons[app] || "App";
    // You'll need to import icons dynamically from lucide-react
    const Icon = dynamic(() =>
      import("lucide-react").then((mod) => mod[iconName]),
    );
    return <Icon size={16} data-oid="5ct41tm" />;
  };

  return (
    <div
      className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center"
      data-oid="ioub_t5"
    >
      <div
        className="relative w-full max-w-md h-[400px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
        data-oid="1cs3xlp"
      >
        <div className="absolute top-2 right-2" data-oid="3519.4q">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-full"
            onClick={onClose}
            data-oid="v.80lhh"
          >
            <X className="h-4 w-4" data-oid="a0p7s0." />
          </Button>
        </div>

        <div className="absolute top-4 left-4" data-oid="ml18tua">
          <h2
            className="text-lg font-semibold text-slate-800 dark:text-slate-200"
            data-oid="j2mc1si"
          >
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Bubble View
          </h2>
        </div>

        <div className="relative w-full h-full" data-oid="9wqwcul">
          {bubbles.map((bubble) => {
            const contact = bubble.contact ? contacts[bubble.contact] : null;

            return expandedBubble === bubble.id ? (
              <InteractiveCard
                key={`bubble-expanded-${bubble.id}`}
                color={bubble.color}
                className="absolute w-full h-full top-0 left-0 z-10 rounded-xl"
                dropShadowIntensity="medium"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedBubble(null);
                }}
                data-oid="tmq0_qc"
              >
                <div className="p-4 w-full" data-oid="ojv4870">
                  <div className="flex items-center mb-2" data-oid="9btx1_8">
                    {contact ? (
                      <Avatar className="h-6 w-6 mr-2 ring-1 ring-offset-1 ring-slate-200/50 dark:ring-slate-700/50 relative z-10" data-oid="s7o.bss">
                        <img
                          src={contact.avatar || "/placeholder.svg"}
                          alt={contact.name}
                          data-oid="6-uqwj8"
                        />
                      </Avatar>
                    ) : (
                      <div className="mr-2" data-oid="ca_5xp-">
                        {bubble.icon}
                      </div>
                    )}
                    <h3
                      className="text-lg font-semibold flex items-center"
                      data-oid="iii5cnr"
                    >
                      {bubble.title}
                      {bubble.trending && (
                        <Sparkles
                          className="h-3 w-3 ml-2 text-amber-500"
                          aria-label="Trending"
                          data-oid="04u0xuu"
                        />
                      )}
                    </h3>
                  </div>
                  <p className="text-sm opacity-80 mb-3" data-oid="l8m19y:">
                    {bubble.content}
                  </p>
                  <div className="flex flex-col gap-2" data-oid="g1:j.7r">
                    <div
                      className="flex items-center text-xs opacity-70"
                      data-oid="d0w9q65"
                    >
                      <AppIcon
                        app={bubble.app}
                        size={12}
                        className="mr-1"
                        data-oid="2mcl5bx"
                      />
                      Priority: {bubble.urgency * bubble.importance}/25
                      {getAutomationIcon(bubble.aiAutomationLevel)}
                    </div>
                    {bubble.achievementBadge && (
                      <div
                        className="flex items-center text-xs text-amber-600 dark:text-amber-400"
                        data-oid="8ho8lne"
                      >
                        <Award
                          className="h-3 w-3 mr-1"
                          aria-label="Achievement Badge"
                          data-oid="hae9jny"
                        />

                        {bubble.achievementBadge}
                      </div>
                    )}
                  </div>
                </div>
              </InteractiveCard>
            ) : (
              <motion.button
                key={`bubble-${bubble.id}`}
                className={cn(
                  "absolute flex items-center justify-center rounded-full p-1 border cursor-pointer",
                  "backdrop-blur-sm",
                  "transition-all duration-200",
                  "shadow-md",
                  colorMap[bubble.color],
                  bubble.trending ? "ring-2 ring-amber-400 animate-pulse" : "",
                )}
                style={{
                  top: bubble.position.top,
                  left: bubble.position.left,
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                }}
                onClick={() => handleBubbleClick(bubble.id)}
                aria-label={`Open ${bubble.title} details`}
                whileHover={{
                  scale: 1.1,
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 17,
                }}
                data-oid="7rcwro9"
              >
                {contact ? (
                  <Avatar className="h-full w-full" data-oid=".f5dfn:">
                    <img
                      src={contact.avatar || "/placeholder.svg"}
                      alt={contact.name}
                      data-oid="0:8_7gy"
                    />
                  </Avatar>
                ) : (
                  <div className="text-current" data-oid="98f0kbv">
                    {bubble.icon}
                  </div>
                )}
                {bubble.trending && (
                  <div className="absolute -top-1 -right-1" data-oid="-uerxmd">
                    <Sparkles
                      className="h-3 w-3 text-amber-500"
                      aria-label="Trending"
                      data-oid="aila243"
                    />
                  </div>
                )}
                {bubble.achievementBadge && (
                  <div
                    className="absolute -bottom-1 -right-1"
                    data-oid="7:rr42."
                  >
                    <Award
                      className="h-3 w-3 text-amber-500"
                      aria-label="Achievement Badge"
                      data-oid="xbfy8gk"
                    />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
