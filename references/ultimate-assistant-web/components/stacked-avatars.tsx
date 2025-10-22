"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import type { Contact } from "@/lib/types/contact";

interface StackedAvatarsProps {
  contacts: Record<string, Contact>;
  attendeeIds: string[];
  size?: "sm" | "md" | "lg";
  limit?: number;
  className?: string;
  showNames?: boolean;
}

export default function StackedAvatars({
  contacts,
  attendeeIds,
  size = "md",
  limit = 3,
  className,
  showNames = false,
}: StackedAvatarsProps) {
  // Filter valid contacts
  const validAttendeeIds = attendeeIds.filter(id => contacts[id]);
  const mainAttendee = validAttendeeIds.length > 0 ? contacts[validAttendeeIds[0]] : null;
  
  // How many attendees to show in the stack
  const visibleAttendees = validAttendeeIds.slice(0, limit);
  const remainingCount = validAttendeeIds.length - limit;
  
  // Sizing classes
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };
  
  // Margin for overlapping
  const negativeMarginClasses = {
    sm: "-ml-2",
    md: "-ml-3",
    lg: "-ml-4",
  };
  
  const avatarSize = sizeClasses[size];
  const negativeMargin = negativeMarginClasses[size];
  
  // If no valid attendees, return null
  if (validAttendeeIds.length === 0) return null;

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex">
        {visibleAttendees.map((attendeeId, index) => {
          const attendee = contacts[attendeeId];
          return (
            <div
              key={attendeeId}
              className={cn(
                "rounded-full border-2 border-white dark:border-slate-800 bg-white dark:bg-slate-800",
                index > 0 ? negativeMargin : ""
              )}
              style={{ zIndex: visibleAttendees.length - index }}
            >
              <Avatar className={cn(avatarSize, "ring-2 ring-white dark:ring-slate-800")}>
                <img
                  src={attendee.avatar || "/placeholder.svg"}
                  alt={attendee.name}
                  className="object-cover"
                />
              </Avatar>
            </div>
          );
        })}
        
        {remainingCount > 0 && (
          <div
            className={cn(
              "rounded-full border-2 border-white dark:border-slate-800 bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-900 dark:text-indigo-100 font-medium",
              negativeMargin,
              avatarSize
            )}
            style={{ zIndex: 0 }}
          >
            <span className={cn(
              size === "sm" ? "text-xs" : "",
              size === "md" ? "text-sm" : "",
              size === "lg" ? "text-base" : ""
            )}>
              +{remainingCount}
            </span>
          </div>
        )}
      </div>
      
      {showNames && mainAttendee && (
        <div className="ml-3">
          <p className={cn(
            "font-medium",
            size === "sm" ? "text-xs" : "",
            size === "md" ? "text-sm" : "",
            size === "lg" ? "text-base" : ""
          )}>
            {mainAttendee.name} {validAttendeeIds.length > 1 ? `& ${validAttendeeIds.length - 1} others` : ""}
          </p>
        </div>
      )}
    </div>
  );
} 