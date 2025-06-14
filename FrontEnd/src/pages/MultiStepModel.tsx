import { useState } from 'react';
import CreateModel from './CreateModel';
import TrainModel from './TrainModel';
import PredictModel from './PredictModel';
import LoadingPage from './LoadingPage';

const MultiStepModel = () => {
  const [step, setStep] = useState<'loading' | 'upload' | 'training' | 'predict'>('loading');
  const [model_id, setModel_id] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState<string>('Buscando modelo...');

  const handleRedirect = (newStep: 'loading' | 'upload' | 'training' | 'predict', modelId?: string, message?: string) => {
    console.log(`Redirecting to step: ${newStep}, modelId: ${modelId}, message: ${message}`);
    
    setModel_id(modelId ?? '');
    if (message) setLoadingMessage(message); // Actualizar el mensaje si se proporciona
    setStep(newStep);
  };

  return (
    <>
      {step === 'loading' && <LoadingPage onRedirect={handleRedirect} message={loadingMessage} />}
      {step === 'upload' && <CreateModel onNext={(id) => handleRedirect('training', id, 'Abriendo tu modelo...')} />}
      {step === 'training' && (
        <TrainModel
          model_id={model_id}
          onNext={() => handleRedirect('loading')}
          onReset={() => handleRedirect('upload')}
        />
      )}
      {step === 'predict' && <PredictModel model_id={model_id} onNext={() => handleRedirect('loading', undefined, 'Eliminando el modelo...')} />}
    </>
  );
};

export default MultiStepModel;
