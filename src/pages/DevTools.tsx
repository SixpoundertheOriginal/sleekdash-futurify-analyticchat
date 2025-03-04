
import { ThreadDebugger } from "@/components/ThreadDebugger";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const DevTools = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-[#1A1F2C] to-[#2d3748]">
        <AppSidebar />
        <main className="flex-1 p-6 animate-fade-up">
          <div className="max-w-7xl mx-auto space-y-6">
            <header className="text-white space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Developer Tools
              </h1>
              <p className="text-white/60">
                Debugging and development utilities for the application
              </p>
            </header>

            <ThreadDebugger />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DevTools;
