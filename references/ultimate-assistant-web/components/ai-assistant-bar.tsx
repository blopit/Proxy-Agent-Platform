"use client";

import { useState } from "react";
import { Mic, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AIAssistantBarProps {
  suggestion: string;
  onVoicePress?: () => void;
  onSendMessage?: (message: string) => Promise<void>;
  isProcessing?: boolean;
}

export default function AIAssistantBar({
  suggestion,
  onVoicePress,
  onSendMessage,
  isProcessing = false,
}: AIAssistantBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSend = async () => {
    if (inputValue.trim() && onSendMessage && !isProcessing) {
      await onSendMessage(inputValue);
      setInputValue("");
      setIsExpanded(false);
    }
  };

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out",
        "hover:bg-white/70 dark:hover:bg-slate-800/70",
      )}
    >
      {/* Main bar - slim and sleek */}
      <div className="h-8 flex items-center justify-between px-3">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "p-0.5 text-indigo-600/80 dark:text-indigo-400/80 transition-all duration-200",
            "hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/50",
            "active:scale-95 h-6 w-6",
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Sparkles className="h-3.5 w-3.5" />
        </Button>

        <div
          className={cn(
            "text-xs font-medium text-center flex-1 truncate px-2 transition-all duration-200",
            "text-indigo-700/90 dark:text-indigo-300/90",
            "hover:text-indigo-700 dark:hover:text-indigo-300",
          )}
        >
          {isExpanded ? "How can I help you?" : "Conscious"}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "p-0.5 text-indigo-600/80 dark:text-indigo-400/80 transition-all duration-200",
            "hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/50",
            "active:scale-95 h-6 w-6",
          )}
          onClick={onVoicePress}
        >
          <Mic className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Expanded section - with smaller padding */}
      {isExpanded && (
        <div className="px-2 py-1.5 space-y-1.5 animate-in fade-in slide-in-from-top duration-300">
          <div
            className={cn(
              "text-xs text-indigo-600/90 dark:text-indigo-400/90",
              "bg-indigo-50/50 dark:bg-indigo-900/30",
              "p-1.5 rounded-lg transition-all duration-200",
              "hover:bg-indigo-50/70 dark:hover:bg-indigo-900/40",
            )}
          >
            {suggestion}
          </div>

          <div className="flex gap-1">
            <Input
              placeholder="Ask me anything..."
              className={cn(
                "bg-white/70 dark:bg-slate-700/70",
                "border-indigo-200/50 dark:border-indigo-800/30",
                "text-xs placeholder:text-indigo-400/60 dark:placeholder:text-indigo-400/40",
                "focus:border-indigo-400/50 dark:focus:border-indigo-600/50",
                "focus:ring-indigo-400/30 dark:focus:ring-indigo-600/30",
                "transition-all duration-200",
                "h-7",
              )}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />

            <Button
              size="icon"
              onClick={handleSend}
              disabled={isProcessing || !inputValue.trim()}
              className={cn(
                "bg-indigo-500/90 hover:bg-indigo-600/90 dark:bg-indigo-600/90 dark:hover:bg-indigo-700/90",
                "transition-all duration-200 ease-out",
                "active:scale-95",
                "h-7 w-7",
                isProcessing && "opacity-50 cursor-not-allowed"
              )}
            >
              {isProcessing ? (
                <span className="animate-spin h-3 w-3">⏳</span>
              ) : (
                <Send className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
