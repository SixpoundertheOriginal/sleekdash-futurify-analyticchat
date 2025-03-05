
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import Index from './pages/Index';
import Auth from './pages/Auth';
import KeywordsAnalysis from './pages/KeywordsAnalysis';
import FileUpload from './pages/FileUpload';
import DevTools from './pages/DevTools';
import NotFound from './pages/NotFound';
import { AuthProvider } from './components/AuthProvider';
import { ErrorBoundary } from '@/components/ui/error-boundary';

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
    <ErrorBoundary fallback={<div className="p-8">Something went wrong. Please refresh the page.</div>}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/keywords" element={<KeywordsAnalysis />} />
              <Route path="/file-upload" element={<FileUpload />} />
              <Route path="/devtools" element={<DevTools />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
