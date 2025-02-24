
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FileUpload } from "@/components/FileUpload";
import { ChatInterface } from "@/components/ChatInterface";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const appCategories = [
  "Games",
  "Business",
  "Education",
  "Entertainment",
  "Finance",
  "Health & Fitness",
  "Lifestyle",
  "Medical",
  "Music",
  "Navigation",
  "News",
  "Productivity",
  "Social Networking",
  "Sports",
  "Travel",
  "Utilities",
];

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-[#1A1F2C] to-[#2d3748]">
        <AppSidebar />
        <main className="flex-1 p-6 animate-fade-up">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <header className="text-white space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                App Store Metadata Generator
              </h1>
              <p className="text-white/60">
                Optimize your app's visibility with data-driven metadata
              </p>
            </header>

            {/* Basic App Information Card */}
            <Card className="p-6 bg-white/5 border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-white">Basic App Information</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="appName" className="text-white">
                      App Name
                    </Label>
                    <span className="text-sm text-white/60">0/30</span>
                  </div>
                  <Input 
                    id="appName" 
                    maxLength={30} 
                    className="bg-white/5 border-white/10 text-white" 
                    placeholder="Enter your app name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appCategory" className="text-white flex items-center gap-2">
                    App Category
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-white/60" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Choose the primary category for your app</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {appCategories.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="appDescription" className="text-white">
                      App Description
                    </Label>
                    <span className="text-sm text-white/60">0/4000</span>
                  </div>
                  <Textarea 
                    id="appDescription" 
                    className="bg-white/5 border-white/10 text-white min-h-[120px]" 
                    placeholder="Describe your app's key features and benefits..."
                    maxLength={4000}
                  />
                </div>
              </div>
            </Card>

            <div className="grid gap-6 grid-cols-12">
              {/* Chat Interface - Takes up most of the space */}
              <div className="col-span-12 lg:col-span-8 xl:col-span-9">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  Analytics Chat
                  <span className="text-sm font-normal text-white/60">AI-Powered Insights</span>
                </h2>
                <ChatInterface />
              </div>
              
              {/* File Upload - Enhanced styling */}
              <div className="col-span-12 lg:col-span-4 xl:col-span-3">
                <h2 className="text-xl font-semibold text-white/80 mb-4">Upload Files</h2>
                <Card className="bg-white/5 border-white/10">
                  <div className="p-4">
                    <FileUpload />
                    <div className="mt-4 flex gap-2 justify-end">
                      <Button variant="outline" size="sm" className="text-white bg-white/5 border-white/10">
                        Download Template
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
