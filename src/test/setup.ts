
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Run cleanup after each test
afterEach(() => {
  cleanup();
});

// Add any React 18 specific test setup here
