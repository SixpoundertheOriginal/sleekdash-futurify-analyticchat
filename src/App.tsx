
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from './components/AuthProvider';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Lazy load route components
const Index = lazy(() => import('./pages/Index'));
const Auth = lazy(() => import('./pages/Auth'));
const KeywordsAnalysis = lazy(() => import('./pages/KeywordsAnalysis'));
const FileUpload = lazy(() => import('./pages/FileUpload'));
const DevTools = lazy(() => import('./pages/DevTools'));
const AppEventsAi = lazy(() => import('./pages/AppEventsAi'));
const CroTestingAi = lazy(() => import('./pages/CroTestingAi'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#1A1F2C] to-[#2d3748]">
    <div className="space-y-4 w-full max-w-md px-4">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
      <div className="space-y-2 pt-4">
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
    </div>
  </div>
);

// Custom error fallback component
const ErrorFallback = () => (
  <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#1A1F2C] to-[#2d3748] p-8 text-white">
    <div className="max-w-md w-full p-6 rounded-lg border border-white/10 bg-white/5">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="p-3 rounded-full bg-rose-500/20">
          <AlertCircle className="h-8 w-8 text-rose-400" />
        </div>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-white/70">We encountered an error while loading the application.</p>
        <Button 
          className="mt-2" 
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Refresh the page
        </Button>
      </div>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    }
  }
});

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/keywords" element={<KeywordsAnalysis />} />
                <Route path="/file-upload" element={<FileUpload />} />
                <Route path="/devtools" element={<DevTools />} />
                <Route path="/app-events-ai" element={<AppEventsAi />} />
                <Route path="/cro-testing-ai" element={<CroTestingAi />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Toaster />
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
