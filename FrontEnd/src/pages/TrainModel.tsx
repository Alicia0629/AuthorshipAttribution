import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Alert, LinearProgress, useTheme } from '@mui/material';
import { checkModelStatus, deleteModel } from '../services/api';
import CustomButton from '../components/Button';

interface TrainModelProps {
  model_id: string;
  onNext: () => void;
  onReset: () => void;
}

const TrainModel: React.FC<TrainModelProps> = ({ model_id, onNext, onReset }) => {
  const [status, setStatus] = useState<string>('IN_QUEUE');
  const [error, setError] = useState<string>('');
  const theme = useTheme();
  const isMounted = useRef(true);
  const token = localStorage.getItem('token');
  console.log("token", token);

  const handleDeleteAndReset = async (token: string) => {
    await deleteModel(model_id, token);
    onReset(); // Reiniciar el flujo al estado inicial
  };
  

  useEffect(() => {
    const checkStatus = async () => {
      try {
        if (!token) throw new Error('No hay sesión activa');
        
        const response = await checkModelStatus(model_id, token);
        
        if (!isMounted.current) return; 

        setStatus(response.status);

        
        if (response.status === 'COMPLETED') {
          isMounted.current = false; // Marcar como desmontado
          onNext(); 
        } else if (response.status === 'FAILED') {
          setError('Error en el entrenamiento del modelo');  
        } else {
          setTimeout(checkStatus, 10000); // Revisar cada 10 segundos
        }
      } catch (err) {
        if (!isMounted.current) return; // Verificar si el componente sigue montado
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    };

    checkStatus();

    return () => {    };
  }, [model_id, onNext, onReset, token]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', my: 4 }}>
      <Box
        alignItems="center"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '600px',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 3,
          boxShadow: 3,
          padding: 3,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Entrenando modelo
        </Typography>

        {error ? (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <CustomButton onClick={() => handleDeleteAndReset(token!)}>
              Eliminar modelo y reiniciar
            </CustomButton>
          </>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                Estado: {status === 'IN_QUEUE'
                  ? 'En cola...'
                  : status === 'IN_PROGRESS'
                  ? 'Entrenando...'
                  : status}
                </Typography>
              <LinearProgress variant= 'indeterminate'/>
            </Box>

            <Typography variant="body2">
              Esto puede tomar varios minutos.
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

export default TrainModel;