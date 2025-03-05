
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { ThreadProvider } from "@/contexts/ThreadContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DevTools from "./pages/DevTools";
import KeywordsAnalysis from "./pages/KeywordsAnalysis";

const queryClient = new QueryClient();

// Move ProtectedRoute inside a separate component that's rendered within AuthProvider
const ProtectedRouteWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-secondary/95">
      <p className="text-white">Loading...</p>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// Create router with future flags
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/"
        element={
          <ProtectedRouteWrapper>
            <ThreadProvider>
              <Index />
            </ThreadProvider>
          </ProtectedRouteWrapper>
        }
      />
      <Route
        path="/keywords"
        element={
          <ProtectedRouteWrapper>
            <ThreadProvider>
              <KeywordsAnalysis />
            </ThreadProvider>
          </ProtectedRouteWrapper>
        }
      />
      <Route
        path="/dev-tools"
        element={
          <ProtectedRouteWrapper>
            <ThreadProvider>
              <DevTools />
            </ThreadProvider>
          </ProtectedRouteWrapper>
        }
      />
      <Route path="*" element={<NotFound />} />
    </>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
