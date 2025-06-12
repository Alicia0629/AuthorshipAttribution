import React from 'react';
import { Box, CircularProgress, Alert, AlertTitle } from '@mui/material';

interface LoadingOrErrorProps {
  loading: boolean;
  error: string;
  children?: React.ReactNode;
}

const LoadingOrError: React.FC<LoadingOrErrorProps> = ({ loading, error, children }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mx={2} my={4}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
};

export default LoadingOrError;