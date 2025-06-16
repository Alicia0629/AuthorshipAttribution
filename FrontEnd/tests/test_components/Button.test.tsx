import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CustomButton from '../../src/components/Button';
import { ThemeProvider, createTheme } from '@mui/material/styles';

describe('CustomButton Component', () => {
  const mockTheme = createTheme({
    palette: {
      secondary: {
        main: '#1976d2',
        dark: '#115293',
      },
      background: {
        paper: '#ffffff',
      },
    },
  });

  it('should render children correctly', () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <CustomButton>Click me</CustomButton>
      </ThemeProvider>
    );

    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should apply custom styles from theme', () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <CustomButton>Test</CustomButton>
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    
    expect(button).toHaveStyle({
      backgroundColor: mockTheme.palette.secondary.main,
      color: mockTheme.palette.background.paper,
      width: '100%',
    });
  });

  it('should pass all ButtonProps to the underlying Button', () => {
    render(
      <ThemeProvider theme={mockTheme}>
        <CustomButton disabled data-testid="test-button">
          Disabled
        </CustomButton>
      </ThemeProvider>
    );

    const button = screen.getByTestId('test-button');
    expect(button).toBeDisabled();
  });
});