import { memo } from 'react';
import AIAssistantBar from "@/components/ai-assistant-bar";
import TabNavigation from "@/components/tab-navigation";
import type { Tab } from '@/lib/types/dashboard';

interface DashboardHeaderProps {
  aiSuggestion: string;
  activeTab: Tab;
  isProcessingMessage: boolean;
  onTabChange: (tabId: string) => void;
  onSendMessage: (message: string) => Promise<void>;
  onVoicePress: () => string;
}

export const DashboardHeader = memo(function DashboardHeader({
  aiSuggestion,
  activeTab,
  isProcessingMessage,
  onTabChange,
  onSendMessage,
  onVoicePress
}: DashboardHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto w-full">
        <div className="glass-header">
          <AIAssistantBar
            suggestion={aiSuggestion}
            onVoicePress={onVoicePress}
            onSendMessage={onSendMessage}
            isProcessing={isProcessingMessage}
          />
          <nav className="tab-container border-none">
            <TabNavigation
              activeTab={activeTab}
              onTabChange={onTabChange}
            />
          </nav>
        </div>
      </div>
    </header>
  );
}); 