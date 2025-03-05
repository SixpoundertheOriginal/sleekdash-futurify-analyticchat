
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { ErrorDisplay } from "@/components/app-store/ErrorDisplay";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 border border-rose-500/20 rounded-lg bg-rose-500/10">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-rose-500 font-medium">An error occurred</p>
                <p className="text-rose-400 text-sm mt-1">
                  {this.state.error?.message || "Something went wrong"}
                </p>
              </div>
            </div>
            <Button 
              onClick={this.resetErrorBoundary}
              variant="outline"
              className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 w-full sm:w-auto"
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
