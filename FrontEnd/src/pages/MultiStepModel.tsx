import React, { useState } from 'react';
import CreateModel from './CreateModel';
import TrainModel from './TrainModel';
import PredictModel from './PredictModel';

const MultiStepModel = () => {
  const [step, setStep] = useState<'upload' | 'training' | 'predict'>('upload');
  const [model_id, setModel_id] = useState<string>('');

  return (
    <>
      {step === 'upload' && <CreateModel  onNext={(id) => {setModel_id(id); setStep('training');}} />}
      {step === 'training' && <TrainModel model_id={model_id} onNext={() => {setStep('predict');}} />}
      {step === 'predict' && <PredictModel model_id={model_id} onNext={() => {setStep('training');}} />}
    </>
  );
};

export default MultiStepModel;
