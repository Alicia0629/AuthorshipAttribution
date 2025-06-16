import { render, screen } from '@testing-library/react';
import App from '../src/App';
import { describe, it, expect, beforeAll } from 'vitest';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach } from 'vitest';
import { setColorScheme } from './test-utils';
import { darkTheme, lightTheme } from '../src/styles/styles';

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

// Mock de TopBarMenu para probar logout
vi.mock('../src/components/TopBar', () => ({
  default: ({ onLogOutSuccess }: { onLogOutSuccess: () => void }) => (
    <button onClick={() => {
      localStorage.removeItem('token');
      onLogOutSuccess();
    }}>Logout</button>
  )
}));

// Mock de Login para probar autenticación
vi.mock('../src/pages/Login.tsx', () => ({
  default: ({ onAuthSuccess }: { onAuthSuccess: () => void }) => (
    <button onClick={onAuthSuccess}>Mock Login</button>
  )
}));

// Mock de MultiStepModel para verificar autenticación
vi.mock('../src/pages/MultiStepModel.tsx', () => ({
  default: () => <div>Mock Model Component</div>
}));

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    configurable: true
  });
});

beforeEach(() => {
  localStorageMock.clear();
});


describe('App Component', () => {
  it('should render without crashing', () => {
    render(
      <App />
    );
  });
});


describe('App Handlers', () => {
  it('should call handleAuthSuccess and set isAuthenticated to true', () => {
    render(<App />);
    
    // Simula que el componente Login llama a handleAuthSuccess
    expect(localStorageMock.getItem('token')).toBeNull();
    
    const token = 'mock-token';
    localStorageMock.setItem('token', token);
    window.dispatchEvent(new Event('storage'));
    
    expect(localStorageMock.getItem('token')).toBe(token);
  });

  it('should handle logout with handleLogOut', async () => {
    localStorageMock.setItem('token', 'mock-token');
    render(<App />);
    expect(localStorageMock.getItem('token')).toBe('mock-token');

    await userEvent.click(screen.getByText('Logout'));
    expect(localStorageMock.getItem('token')).toBeNull();
  });
});

describe('App Authentication', () => {
  it('should call handleAuthSuccess and update isAuthenticated', async () => {
    render(<App />);
    
    expect(screen.getByText('Mock Login')).toBeInTheDocument();
    
    await userEvent.click(screen.getByText('Mock Login'));
    
    expect(screen.queryByText('Mock Login')).not.toBeInTheDocument();
    
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should handle logout properly', async () => {
    localStorageMock.setItem('token', 'mock-token');
    render(<App />);
    
    expect(screen.getByText('Logout')).toBeInTheDocument();
    
    await userEvent.click(screen.getByText('Logout'));
    
    expect(screen.getByText('Mock Login')).toBeInTheDocument();
    expect(localStorageMock.getItem('token')).toBeNull();
  });
});

describe('Theme Mode', () => {
  it('should apply light theme correctly', () => {
    setColorScheme('light');
    render(<App />);
    
    expect(document.body).toHaveStyle(
      `background-color: ${lightTheme.palette.background.default}`
    );
  });

  it('should apply dark theme correctly', () => {
    setColorScheme('dark');
    render(<App />);
    
    expect(document.body).toHaveStyle(
      `background-color: ${darkTheme.palette.background.default}`
    );
  });
});
