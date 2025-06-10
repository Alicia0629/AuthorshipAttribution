import { useState, useEffect } from 'react';
import CreateModel from './CreateModel';
import TrainModel from './TrainModel';
import PredictModel from './PredictModel';
import { getLatestModel } from '../services/api';
import { CircularProgress, useTheme } from '@mui/material';

const MultiStepModel = () => {
  const [step, setStep] = useState<'upload' | 'training' | 'predict'>('upload');
  const [model_id, setModel_id] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchLatestModel = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No hay sesión activa');

        const response = await getLatestModel(token);

        if (response.status === 'no_model') {
          setStep('upload');
        } else if (response.status === 'training') {
          setModel_id(response.model_id);
          setStep('training');
        } else if (response.status === 'trained') {
          setModel_id(response.model_id);
          setStep('predict');
        }
      } catch (err) {
        console.error('Error al obtener el modelo más reciente:', err);
        setStep('upload');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestModel();
  }, []);

  if (loading) {
    return (
       <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
    );
  }

  return (
    <>
      {step === 'upload' && <CreateModel  onNext={(id) => {setModel_id(id); setStep('training');}} />}
      {step === 'training' && (
        <TrainModel
          model_id={model_id}
          onNext={() => setStep('predict')}
          onReset={() => {
            setModel_id('');
            setStep('upload');
          }}
        />
      )}
      {step === 'predict' && <PredictModel model_id={model_id} onNext={() => {setStep('upload');}} />}
    </>
  );
};

export default MultiStepModel;
