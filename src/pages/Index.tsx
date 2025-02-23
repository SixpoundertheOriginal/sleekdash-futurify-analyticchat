
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FileUpload } from "@/components/FileUpload";
import { ChatInterface } from "@/components/ChatInterface";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-secondary to-secondary/95">
        <AppSidebar />
        <main className="flex-1 p-6 animate-fade-up">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid gap-6 grid-cols-12">
              {/* Chat Interface - Takes up most of the space */}
              <div className="col-span-12 lg:col-span-8 xl:col-span-9">
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  Analytics Chat
                  <span className="text-sm font-normal text-white/60">AI-Powered Insights</span>
                </h2>
                <ChatInterface />
              </div>
              
              {/* File Upload - Smaller section */}
              <div className="col-span-12 lg:col-span-4 xl:col-span-3">
                <h2 className="text-xl font-semibold text-white/80 mb-4">Upload Files</h2>
                <FileUpload />
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
