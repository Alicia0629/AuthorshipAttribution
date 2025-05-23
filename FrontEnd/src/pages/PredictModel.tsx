interface PredictModelProps {
  model_id: string;
  onNext: () => void;
}

const PredictModel: React.FC<PredictModelProps> = ({ model_id, onNext }) => {
    return (
      <div>
        <h2>Predict</h2>
        <p>{model_id}</p>
      </div>
    );
  };
  
  export default PredictModel;
  