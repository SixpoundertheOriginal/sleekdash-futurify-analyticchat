
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

/**
 * Custom render function that wraps components with providers if needed
 * Useful for testing components that require context providers
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { 
    // Add any custom wrapper options here
    initialZustandState?: Record<string, any>
  }
) => {
  const AllProviders = ({ children }: { children: React.ReactNode }) => {
    // Add any providers that are needed for testing here
    return (
      <>{children}</>
    );
  };
  
  return render(ui, { wrapper: AllProviders, ...options });
};

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };
