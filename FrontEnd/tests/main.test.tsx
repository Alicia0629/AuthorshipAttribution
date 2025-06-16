import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../src/App.tsx';

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}));

vi.mock('./App.tsx', () => ({
  default: () => <div>Mock App</div>,
}));

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    StrictMode: vi.fn(({ children }) => children),
  };
});

describe('main.tsx', () => {
  const mockRootElement = document.createElement('div');
  mockRootElement.id = 'root';
  document.body.appendChild(mockRootElement);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.removeChild(mockRootElement);
  });

  it('should call createRoot with the root element', async () => {
    await import('../src/main.tsx');
    
    expect(createRoot).toHaveBeenCalledWith(mockRootElement);
  });

});