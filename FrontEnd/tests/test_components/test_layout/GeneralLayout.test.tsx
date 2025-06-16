import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GeneralLayout from '../../../src/components/Layout/GeneralLayout';
import { ThemeProvider, createTheme } from '@mui/material/styles';

describe('AuthLayout Component', () => {
  const mockTheme = createTheme();
  
  it('should correctly render children components inside GeneralLayout', () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <GeneralLayout>
          <div>Test Child</div>
        </GeneralLayout>
      </ThemeProvider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });
});