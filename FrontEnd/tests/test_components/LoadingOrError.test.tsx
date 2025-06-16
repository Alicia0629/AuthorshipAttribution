import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingOrError from '../../src/components/LoadingOrError';
import { CircularProgress, Alert } from '@mui/material';

describe('LoadingOrError Component', () => {
  it('should render children when not loading and no error', () => {
    render(
      <LoadingOrError loading={false} error="">
        <div data-testid="content">Child Content</div>
      </LoadingOrError>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });


  it('should render Alert when there is an error', () => {
    const errorMessage = 'Something went wrong';
    render(<LoadingOrError loading={false} error={errorMessage} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Error');
    expect(alert).toHaveTextContent(errorMessage);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('should prioritize loading state over error state', () => {
    render(<LoadingOrError loading={true} error="Some error" />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should have proper styling for loading indicator', () => {
    render(<LoadingOrError loading={true} error="" />);

    const box = screen.getByRole('progressbar').parentElement;
    expect(box).toHaveStyle('display: flex');
    expect(box).toHaveStyle('justify-content: center');
    expect(box).toHaveStyle('margin-top: 32px'); // mt={4} translates to 32px
  });

  it('should have proper styling for error alert', () => {
    render(<LoadingOrError loading={false} error="Error" />);

    const box = screen.getByRole('alert').parentElement;
    expect(box).toHaveStyle('margin-left: 16px'); // mx={2} translates to 16px
    expect(box).toHaveStyle('margin-right: 16px');
    expect(box).toHaveStyle('margin-top: 32px'); // my={4} translates to 32px
    expect(box).toHaveStyle('margin-bottom: 32px');
  });
});