
import { KeywordsSection } from "@/components/KeywordsSection";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const KeywordsAnalysis = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-[#1A1F2C] to-[#2d3748]">
        <AppSidebar />
        <main className="flex-1 p-6 animate-fade-up">
          <div className="max-w-7xl mx-auto space-y-6">
            <header className="text-white space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Deep Keywords Analysis & AI Insights
              </h1>
              <p className="text-white/60">
                Analyze keyword performance and get AI-powered recommendations to optimize your App Store presence
              </p>
            </header>

            <KeywordsSection />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default KeywordsAnalysis;
