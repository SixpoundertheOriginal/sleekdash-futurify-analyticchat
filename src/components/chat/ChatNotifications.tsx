
import { AlertTriangle, RefreshCw, MessageSquareText, Info, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContextualHelp } from "@/components/ui/contextual-help";
import { AssistantType } from "@/utils/thread-management";

interface ChatNotificationsProps {
  isValidThread: boolean;
  onCreateNewThread: () => void;
  lastFileUpload: Date | null;
  isCheckingForResponses: boolean;
  isProcessing: boolean;
  feature?: AssistantType;
}

export function ChatNotifications({
  isValidThread,
  onCreateNewThread,
  lastFileUpload,
  isCheckingForResponses,
  isProcessing,
  feature = 'general'
}: ChatNotificationsProps) {

  // Customize tip based on feature
  const getTipContent = () => {
    switch (feature) {
      case 'keywords':
        return "Try asking about keyword trends, research suggestions, or upload a keyword file for in-depth analysis.";
      case 'appStore':
        return "Try asking about downloads, revenue trends, or upload App Store data for detailed analysis.";
      default:
        return "Try asking about data trends, performance metrics, or upload a file for in-depth analysis.";
    }
  };

  const tipContent = getTipContent();
  const tipBgClass = feature === 'keywords' ? 'bg-indigo-600/10' : 'bg-primary/10';
  const tipTextClass = feature === 'keywords' ? 'text-indigo-300' : 'text-primary-foreground/80';

  return (
    <>
      {!isValidThread && (
        <div className="flex items-center gap-2 p-2 bg-red-500/20 text-red-200 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="flex-1">
            Thread validation failed. Messages may not be stored correctly.
            <Button
              variant="link"
              className="text-red-200 underline pl-1 h-auto p-0 text-xs"
              onClick={onCreateNewThread}
            >
              Create new thread?
            </Button>
          </span>
          <ContextualHelp 
            icon="info"
            size="sm"
            content={
              <div>
                <p className="font-medium">About Thread Validation:</p>
                <p className="mt-1 text-xs">Threads store your conversation history to provide context for future responses.</p>
                <p className="mt-1 text-xs">When thread validation fails, it means:</p>
                <ul className="list-disc pl-4 mt-1 space-y-1 text-xs">
                  <li>Your conversation history might not be saved correctly</li>
                  <li>The AI may not have full context of your previous messages</li>
                  <li>You may experience inconsistent responses</li>
                </ul>
                <p className="mt-1 text-xs">Creating a new thread will resolve this issue but will start a fresh conversation.</p>
              </div>
            } 
          />
        </div>
      )}
      
      {lastFileUpload && (isCheckingForResponses || isProcessing) && (
        <div className="flex items-center gap-2 p-2 bg-blue-500/20 text-blue-200 text-xs border-b border-blue-500/20">
          <RefreshCw className="h-3 w-3 flex-shrink-0 animate-spin" />
          <span>
            File uploaded at {lastFileUpload.toLocaleTimeString()}. Analyzing your data...
          </span>
          <ContextualHelp 
            icon="info"
            size="sm"
            content={
              <div>
                <p>File analysis is processing your data through multiple steps:</p>
                <ol className="list-decimal pl-4 mt-1 space-y-1 text-xs">
                  <li>Validating file format and content</li>
                  <li>Extracting relevant metrics and data points</li>
                  <li>Processing trends and patterns</li>
                  <li>Generating insights based on historical data</li>
                </ol>
                <p className="mt-1 text-xs">This process typically takes 30-60 seconds depending on file size and complexity.</p>
              </div>
            } 
          />
        </div>
      )}

      {/* New user onboarding hint */}
      <div className={`flex items-center gap-2 p-2 ${tipBgClass} ${tipTextClass} text-xs border-b ${feature === 'keywords' ? 'border-indigo-600/10' : 'border-primary/10'}`}>
        <Info className="h-3.5 w-3.5 flex-shrink-0" />
        <span>
          <span className="font-medium">Pro tip:</span> {tipContent}
        </span>
        <ContextualHelp 
          icon="help"
          size="sm"
          content={
            <div>
              <p className="font-medium">Getting Started Tips:</p>
              <ul className="list-disc pl-4 mt-1 space-y-1 text-xs">
                {feature === 'keywords' ? (
                  <>
                    <li>Upload keyword files for detailed analysis</li>
                    <li>Ask specific questions about keywords like "What are my best performing keywords?"</li>
                    <li>Request suggestions: "Give me keyword ideas for my fitness app"</li>
                    <li>Analyze competition: "How competitive is the keyword 'workout tracker'?"</li>
                    <li>Ask for optimization tips: "How can I improve my keyword strategy?"</li>
                  </>
                ) : (
                  <>
                    <li>Upload data files for detailed analysis</li>
                    <li>Ask specific questions about metrics like "What's my conversion rate?"</li>
                    <li>Use date ranges in your queries: "Show me downloads from last month"</li>
                    <li>Request comparisons: "Compare this month's performance to last month"</li>
                    <li>Ask for action items: "What should I improve based on this data?"</li>
                  </>
                )}
              </ul>
            </div>
          } 
        />
      </div>
    </>
  );
}
