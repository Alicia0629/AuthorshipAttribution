import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import TopBar from '../../src/components/TopBar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';

// Mock de las dependencias
vi.mock('../../src/services/api', () => ({
  deleteUserAccount: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('TopBar Component', () => {
  const mockTheme = createTheme();
  const mockLogOutSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ThemeProvider theme={mockTheme}>
          <TopBar onLogOutSuccess={mockLogOutSuccess} />
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  it('should render the menu button correctly', () => {
    renderComponent();
    
    const button = screen.getByRole('button', { name: /opciones/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle({
      backgroundColor: mockTheme.palette.secondary.main,
      color: mockTheme.palette.background.paper,
    });
  });

  it('should open menu when button is clicked', async () => {
    renderComponent();
    const user = userEvent.setup();
    
    const button = screen.getByRole('button', { name: /opciones/i });
    await user.click(button);
    
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
  });

  it('should show delete account and logout options', async () => {
    renderComponent();
    const user = userEvent.setup();
    
    await user.click(screen.getByRole('button', { name: /opciones/i }));
    
    expect(screen.getByText(/eliminar cuenta/i)).toBeInTheDocument();
    expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument();
  });

  it('should call logout function when logout is clicked', async () => {
    renderComponent();
    const user = userEvent.setup();
    
    await user.click(screen.getByRole('button', { name: /opciones/i }));
    await user.click(screen.getByText(/cerrar sesión/i));
    
    expect(mockLogOutSuccess).toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should show confirmation dialog when delete account is clicked', async () => {
    window.confirm = vi.fn(() => true);
    renderComponent();
    const user = userEvent.setup();
    
    await user.click(screen.getByRole('button', { name: /opciones/i }));
    await user.click(screen.getByText(/eliminar cuenta/i));
    
    expect(window.confirm).toHaveBeenCalledWith(
      '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.'
    );
  });

  it('should call deleteUserAccount when confirmation is accepted', async () => {
    const { deleteUserAccount } = await import('../../src/services/api');
    deleteUserAccount.mockResolvedValueOnce({});
    window.confirm = vi.fn(() => true);
    
    renderComponent();
    const user = userEvent.setup();
    
    await user.click(screen.getByRole('button', { name: /opciones/i }));
    await user.click(screen.getByText(/eliminar cuenta/i));
    
    await waitFor(() => {
      expect(deleteUserAccount).toHaveBeenCalledWith('test-token');
      expect(mockLogOutSuccess).toHaveBeenCalled();
    });
  });

  it('should not call deleteUserAccount when confirmation is canceled', async () => {
    const { deleteUserAccount } = await import('../../src/services/api');
    window.confirm = vi.fn(() => false);
    
    renderComponent();
    const user = userEvent.setup();
    
    await user.click(screen.getByRole('button', { name: /opciones/i }));
    await user.click(screen.getByText(/eliminar cuenta/i));
    
    expect(deleteUserAccount).not.toHaveBeenCalled();
    expect(mockLogOutSuccess).not.toHaveBeenCalled();
  });

  it('should handle delete account error', async () => {
    const { deleteUserAccount } = await import('../../src/services/api');
    const errorMessage = 'Error deleting account';
    deleteUserAccount.mockRejectedValueOnce(new Error(errorMessage));
    window.confirm = vi.fn(() => true);
    console.error = vi.fn();
    
    renderComponent();
    const user = userEvent.setup();
    
    await user.click(screen.getByRole('button', { name: /opciones/i }));
    await user.click(screen.getByText(/eliminar cuenta/i));
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });
});