"use client";

import { useMemo, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { useMainFocusTile, useContacts, useTiles } from "@/lib/hooks/useApiData";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { interactionService } from "@/lib/services/interactionService";
import MainFocusCard from "@/components/main-focus-card";
import { tabBackgroundColors } from "@/lib/constants/dashboard";
import type { Tile } from "@/lib/types/tile";

export default function Home() {
  // Use the custom dashboard hook for state management
  const { 
    state, 
    handleTabChange, 
    handleSendMessage, 
    scrollToSection,
    setInitialLoadingComplete
  } = useDashboard();
  
  // Data fetching hooks
  const { data: contactsData, isLoading: loadingContacts } = useContacts();
  const { data: mainFocusTile, isLoading: loadingMainFocus } = useMainFocusTile(state.activeTab);
  const { data: allTiles, isLoading: loadingTiles } = useTiles();
  
  // Set initial loading state to false once data is loaded
  useEffect(() => {
    if (contactsData && allTiles && !loadingContacts && !loadingTiles) {
      setInitialLoadingComplete();
    }
  }, [contactsData, allTiles, loadingContacts, loadingTiles, setInitialLoadingComplete]);

  // Create contacts record for easier access - memoized to prevent recreation
  const contactsRecord = useMemo(() => {
    if (!contactsData || !Array.isArray(contactsData)) return {};
    return contactsData.reduce((acc, contact) => {
      acc[contact.id] = contact;
      return acc;
    }, {} as Record<string, typeof contactsData[0]>);
  }, [contactsData]);

  // Filter tiles for each section - memoized for performance
  const matchedTiles = useMemo(() => {
    if (!allTiles || !Array.isArray(allTiles)) return [];
    
    // Filter tiles based on tab and section
    return allTiles.filter(tile => {
      if (!tile || !tile.id) return false;
      
      // Match by ID from any section's items
      const matchById = state.activeSections.some(section => 
        section.items.includes(tile.id)
      );
      
      if (matchById) return true;
      
      // Fallback to category matching
      if (tile.category) {
        const category = tile.category.toLowerCase();
        switch(state.activeTab) {
          case "dashboard": return true;
          case "tasks": return category === "tasks";
          case "calendar": return category === "calendar";
          case "messages": return ["messengers", "alerts"].includes(category);
          case "learning": return category === "learn";
          case "wellness": return ["wellness", "health"].includes(category);
          case "entertainment": return ["entertainment", "social"].includes(category);
          default: return false;
        }
      }
      
      return false;
    });
  }, [allTiles, state.activeSections, state.activeTab]);

  // Create a memoized function to get tiles for a specific section
  const getSectionTiles = useCallback((sectionItems: string[]) => {
    return matchedTiles.filter(tile => sectionItems.includes(tile.id));
  }, [matchedTiles]);

  // Create a memoized main focus tile component to prevent re-renders
  const MainFocusTileComponent = useMemo(() => {
    if (!mainFocusTile || state.isTabChanging) return null;
    
    return (
      <MainFocusCard
        key={`main-focus-${state.activeTab}`}
        tile={mainFocusTile}
        contacts={contactsRecord}
        isLoading={loadingMainFocus}
      />
    );
  }, [mainFocusTile, state.isTabChanging, state.activeTab, contactsRecord, loadingMainFocus]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleSendMessageAsync = useCallback(async (message: string) => {
    await handleSendMessage(message);
  }, [handleSendMessage]);

  return (
    <>
      {/* Fixed Background with higher opacity */}
      <div className={cn(
        "fixed inset-0 -z-10",
        tabBackgroundColors[state.activeTab],
        "transition-colors duration-500"
      )} />
      
      {/* Main Content */}
      <main className="flex min-h-screen flex-col items-center relative">
        {/* Fixed Header with AI Assistant and Tabs */}
        <DashboardHeader
          aiSuggestion={state.aiSuggestion}
          activeTab={state.activeTab}
          isProcessingMessage={state.isProcessingMessage}
          onTabChange={handleTabChange}
          onSendMessage={handleSendMessageAsync}
          onVoicePress={interactionService.handleVoicePress}
        />

        {/* Main Dashboard Content */}
        <DashboardContent
          state={state}
          mainFocusTileComponent={MainFocusTileComponent}
          getSectionTiles={getSectionTiles}
          contactsRecord={contactsRecord}
          onScrollToSection={scrollToSection}
        />
      </main>
    </>
  );
}
