
import React from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AppEventsAi() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-[#1A1F2C] to-[#2d3748]">
        <AppSidebar />
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">In-App Events Intelligence</h1>
              <p className="text-white/70 mt-2">
                AI assistant to analyze your app's events, user journeys, and behavior patterns to provide actionable insights for optimization.
              </p>
            </div>
            
            <ChatInterface feature="appEvents" />
            
            <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <p className="flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-500 mr-2"></span>
                This feature is in beta. Speak with the AI about your in-app events and user journeys to get optimization suggestions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
