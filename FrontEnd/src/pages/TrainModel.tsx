import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, LinearProgress, useTheme } from '@mui/material';
import { checkModelStatus } from '../services/api';

interface TrainModelProps {
  model_id: string;
  onNext: () => void;
}

const TrainModel: React.FC<TrainModelProps> = ({ model_id, onNext }) => {
  const [status, setStatus] = useState<string>('training');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const theme = useTheme();
  

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;
    if (!isMounted) return;
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No hay sesión activa');
        
        const response = await checkModelStatus(model_id, token);
        console.log(response);
        
        setStatus(response.status);
        if (response.progress) setProgress(response.progress);
        
        if (response.status === 'COMPLETED') {
          onNext();
        } else if (response.status === 'FAILED') {
          setError('Error en el entrenamiento del modelo');
        } else {
          timeoutId = setTimeout(checkStatus, 10000); // Revisar cada 10 segundos
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [model_id, onNext]);
  

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', my: 4 }}>
          <Box alignItems="center" sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: "600px",
              backgroundColor: theme.palette.background.paper,
              borderRadius: 3,
              boxShadow: 3,
              padding: 3,
            }}>
              <Typography variant="h4" gutterBottom>Entrenando modelo</Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Estado: {status === 'training' ? 'Entrenando...' : status}
                </Typography>
                <LinearProgress 
                  variant={progress ? 'determinate' : 'indeterminate'} 
                  value={progress} 
                />
                {progress > 0 && (
                  <Typography variant="body2" align="right">
                    {progress}% completado
                  </Typography>
                )}
              </Box>
              
              <Typography variant="body2">
                Esto puede tomar varios minutos. Por favor no cierres esta página.
              </Typography>
            </Box>
    </Box>
  );
};

export default TrainModel;