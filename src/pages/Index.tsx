
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
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Upload Files</h2>
                <FileUpload />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Analytics Chat</h2>
                <ChatInterface />
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
