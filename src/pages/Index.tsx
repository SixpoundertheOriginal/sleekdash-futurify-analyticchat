
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppStoreAnalysis } from "@/components/AppStoreAnalysis";
import { KeywordsSection } from "@/components/KeywordsSection";
import { BarChart } from "lucide-react";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-[#1A1F2C] to-[#2d3748]">
        <AppSidebar />
        <main className="flex-1 p-6 animate-fade-up">
          <div className="max-w-7xl mx-auto space-y-6">
            <header className="text-white space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                App Store Analytics Dashboard
              </h1>
              <p className="text-white/60">
                Monitor your app's performance and optimize your marketing strategy
              </p>
            </header>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 pb-2 border-b border-white/10">
                <BarChart className="h-5 w-5 text-primary" />
                KPI Overview
              </h2>
              <AppStoreAnalysis />
            </div>

            <KeywordsSection />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
