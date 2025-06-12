import { useEffect, useRef, useState } from 'react';
import { CircularProgress, Box, Typography, useTheme } from '@mui/material';
import { getLatestModel, predictText, checkModelStatus } from '../services/api';

interface LoadingPageProps {
    onRedirect: (step: 'upload' | 'training' | 'predict', model_id?: string) => void;
    message?: string;
}

const DEFULT_MESSAGE = 'Buscando modelo...';

const LoadingPage: React.FC<LoadingPageProps> = ({ onRedirect, message=DEFULT_MESSAGE }) => {
  const theme = useTheme();
  const [currentMessage, setCurrentMessage] = useState<string>(message);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return; // Evitar múltiples inicializaciones
    hasInitialized.current = true; 

    const initPage = async () => {
      console.log('LoadingPage: initPage');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No hay sesión activa');

        const response = await getLatestModel(token);

        if (response.status === 'no_model') {
          console.log('onRedirect: upload');
          onRedirect('upload');
          return;
        }

        const model_id = response.model_id;

        if (response.status === 'training') {
          console.log('onRedirect: training', model_id);
          onRedirect('training', model_id);
          return;
        }

        if (response.status === 'trained') {
            console.log('onRedirect: trained', model_id);
            if (currentMessage === DEFULT_MESSAGE){
                setCurrentMessage('Preparando el modelo para la predicción...');
            }
            await predictText('test', model_id, token);
            const interval = setInterval(async () => {
                try {
                const response = await checkModelStatus(model_id, token);
                if (response.status === 'COMPLETED') {
                    clearInterval(interval);
                    onRedirect('predict', model_id);
                } else if (response.status === 'deleted') {
                    clearInterval(interval);
                    onRedirect('upload');
                }
                } catch (error) {
                console.error('Error al verificar el modelo en Runpod:', error);
                clearInterval(interval);
                onRedirect('upload');
                }
            }, 5000); // Verificar cada 5 segundos
            }
      } catch (error) {
        console.error('Error al comprobar el estado del modelo:', error);
        onRedirect('upload');
      }
    };

    initPage();
  }, [onRedirect, currentMessage]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress size={80} sx={{ color: theme.palette.primary.main, mb: 3 }} />
      <Typography variant="h6" color="textSecondary">
        {currentMessage}
      </Typography>
    </Box>
  );
};

export default LoadingPage;