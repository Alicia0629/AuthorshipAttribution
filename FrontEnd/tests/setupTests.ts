import '@testing-library/jest-dom/vitest';

import { vi } from 'vitest';

vi.stubEnv('VITE_API_URL', 'http://test-api.com');


Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query === '(prefers-color-scheme: dark)', // Simula que el esquema de color es oscuro
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});
