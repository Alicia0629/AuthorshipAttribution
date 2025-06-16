import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AuthLayout from '../../../src/components/Layout/AuthLayout';
import { ThemeProvider, createTheme } from '@mui/material/styles';

describe('AuthLayout Component', () => {
  const mockTheme = createTheme();
  
  it('should correctly render children components inside AuthLayout', () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <AuthLayout>
          <div>Test Child</div>
        </AuthLayout>
      </ThemeProvider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });
});