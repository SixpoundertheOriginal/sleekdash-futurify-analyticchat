
import { Card } from "@/components/ui/card";
import { Message } from "@/types/chat";
import { PinIcon, Clock, MessageSquare, FilePlus, ChevronRight, User2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ChatStatsProps {
  messages: Message[];
  lastFileUpload: Date | null;
  isProcessing: boolean;
}

export function ChatStats({ messages, lastFileUpload, isProcessing }: ChatStatsProps) {
  const [pinnedInsights, setPinnedInsights] = useState<Message[]>([]);
  const [showAllInsights, setShowAllInsights] = useState(false);
  
  // Calculate stats
  const totalMessages = messages.length;
  const userMessages = messages.filter(m => m.role === 'user').length;
  const assistantMessages = messages.filter(m => m.role === 'assistant').length;
  const avgResponseLength = Math.round(
    messages
      .filter(m => m.role === 'assistant' && typeof m.content === 'string')
      .reduce((sum, m) => sum + (typeof m.content === 'string' ? m.content.length : 0), 0) / 
    Math.max(assistantMessages, 1)
  );
  
  // Format time for display
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes === 1) return '1 minute ago';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    return `${diffDays} days ago`;
  };
  
  // For demonstration, let's add some sample pinned insights
  useEffect(() => {
    const sampleInsights = [
      {
        role: 'assistant' as const,
        content: '📊 Your top performing keyword "marketing analytics" has a 23% higher conversion rate than average.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        id: 'pinned-1'
      },
      {
        role: 'assistant' as const,
        content: '🔍 Analysis shows your competitors are targeting "SEO tools" with 45% more content than last month.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        id: 'pinned-2'
      }
    ];
    
    setPinnedInsights(sampleInsights);
  }, []);

  // Convert timestamp to Date if it's a string
  const getDateFromTimestamp = (timestamp: Date | string | undefined): Date => {
    if (!timestamp) return new Date();
    if (timestamp instanceof Date) return timestamp;
    return new Date(timestamp);
  };

  return (
    <Card className="w-80 h-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg overflow-hidden flex flex-col">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-medium text-white/90">Analytics Overview</h2>
      </div>
      
      <div className="p-4 space-y-5 flex-1 overflow-y-auto">
        {/* Conversation Stats */}
        <div>
          <h3 className="text-sm font-medium text-white/70 mb-3">Conversation Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="h-4 w-4 text-primary/70" />
                <span className="text-xs text-white/60">Messages</span>
              </div>
              <p className="text-xl font-semibold text-white/90">{totalMessages}</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <FilePlus className="h-4 w-4 text-primary/70" />
                <span className="text-xs text-white/60">Uploads</span>
              </div>
              <p className="text-xl font-semibold text-white/90">{lastFileUpload ? 1 : 0}</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <User2 className="h-4 w-4 text-primary/70" />
                <span className="text-xs text-white/60">Your Messages</span>
              </div>
              <p className="text-xl font-semibold text-white/90">{userMessages}</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Bot className="h-4 w-4 text-primary/70" />
                <span className="text-xs text-white/60">AI Responses</span>
              </div>
              <p className="text-xl font-semibold text-white/90">{assistantMessages}</p>
            </div>
          </div>
        </div>
        
        {/* Last Activity */}
        <div>
          <h3 className="text-sm font-medium text-white/70 mb-3">Recent Activity</h3>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary/70" />
                <span className="text-sm text-white/80">Last Upload</span>
              </div>
              <span className="text-xs text-white/60">{lastFileUpload ? formatTimeAgo(lastFileUpload) : 'None'}</span>
            </div>
            {lastFileUpload && isProcessing && (
              <p className="text-xs text-primary/70 mt-1">Processing in progress...</p>
            )}
          </div>
        </div>
        
        {/* Pinned Insights */}
        <div>
          <h3 className="text-sm font-medium text-white/70 mb-3">Pinned Insights</h3>
          {pinnedInsights.length === 0 ? (
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-sm text-white/60">No pinned insights yet</p>
              <p className="text-xs text-white/40 mt-1">Click the pin icon on any message to save it here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pinnedInsights.slice(0, showAllInsights ? undefined : 2).map((insight, index) => (
                <div key={insight.id || index} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <PinIcon className="h-3.5 w-3.5 text-primary/70" />
                      <span className="text-xs text-white/50">Pinned {formatTimeAgo(getDateFromTimestamp(insight.timestamp))}</span>
                    </div>
                  </div>
                  <p className="text-sm text-white/80 line-clamp-2">{insight.content.toString()}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-6 px-2 text-xs text-primary/70 hover:text-primary"
                  >
                    View Detail
                  </Button>
                </div>
              ))}
              
              {pinnedInsights.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs flex items-center justify-center"
                  onClick={() => setShowAllInsights(!showAllInsights)}
                >
                  {showAllInsights ? 'Show Less' : `View ${pinnedInsights.length - 2} More`}
                  <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showAllInsights ? 'rotate-90' : ''}`} />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
