
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
import { ErrorBoundary } from "@/components/ui/error-boundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      useErrorBoundary: true
    },
    mutations: {
      useErrorBoundary: true
    }
  }
});

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
    <ErrorBoundary>
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
                    <ErrorBoundary>
                      <Index />
                    </ErrorBoundary>
                  </ThreadProvider>
                </ProtectedRoute>
              } />
              <Route path="/keywords" element={
                <ProtectedRoute>
                  <ThreadProvider>
                    <ErrorBoundary>
                      <KeywordsAnalysis />
                    </ErrorBoundary>
                  </ThreadProvider>
                </ProtectedRoute>
              } />
              <Route path="/dev-tools" element={
                <ProtectedRoute>
                  <ThreadProvider>
                    <ErrorBoundary>
                      <DevTools />
                    </ErrorBoundary>
                  </ThreadProvider>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
