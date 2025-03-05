
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { 
  Navigate,
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { ThreadProvider } from "@/contexts/ThreadContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DevTools from "./pages/DevTools";
import KeywordsAnalysis from "./pages/KeywordsAnalysis";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-secondary/95">
      <p className="text-white">Loading...</p>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Router>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <ThreadProvider>
                  <Index />
                </ThreadProvider>
              </ProtectedRoute>
            } />
            <Route path="/keywords" element={
              <ProtectedRoute>
                <ThreadProvider>
                  <KeywordsAnalysis />
                </ThreadProvider>
              </ProtectedRoute>
            } />
            <Route path="/dev-tools" element={
              <ProtectedRoute>
                <ThreadProvider>
                  <DevTools />
                </ThreadProvider>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </Router>
  </QueryClientProvider>
);

export default App;
