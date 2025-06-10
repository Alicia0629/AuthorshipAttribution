import { Box, Typography, IconButton, useTheme, Paper, TextField, LinearProgress, CircularProgress } from '@mui/material';
import { useEffect, useState } from "react";
import SendIcon from '@mui/icons-material/Send';
import { predictText, checkModelStatus, getModelDetails , deleteModel} from '../services/api.ts';

interface PredictModelProps {
  model_id: string;
  onNext: (step?: string, data?: any, message?: string) => void;
}

interface ModelData {
  model_id: string;
  status: string;
  num_labels: number;
  eval_accuracy: number;
  eval_f1: number;
  eval_loss: number;
  created_at: string;
}

interface PredictionResult {
  text: string;
  prediction: string;
  confidence: number;
  probabilities?: Record<string, number>;
}

const PredictModel: React.FC<PredictModelProps> = ({ model_id, onNext }) => {
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [text, setText] = useState("");
  const [currentText, setCurrentText] = useState("");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const theme = useTheme();
  const token = localStorage.getItem('token') || '';
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<PredictionResult[]>([]);
  const [status, setStatus] = useState<string>('IN_QUEUE');

  useEffect(() => {
    // Llamar al endpoint para obtener los datos del modelo
    const fetchModelDetails = async () => {
      try {
        const data = await getModelDetails(model_id, token);
        setModelData(data);
      } catch (error) {
        console.error("Error al obtener los datos del modelo:", error);
      }
    };

    fetchModelDetails();
  }, [model_id, token]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        console.log("Comprobando el estado del modelo...");
        checkModelStatus(model_id, token)
          .then((data) => {
            console.log(data);
            setStatus(data.status);
            if (data.status === 'COMPLETED') {
              setLoading(false);
              setResult({
                text: currentText, // Usar el texto enviado
                prediction: data.output.prediction,
                confidence: data.output.confidence,
                probabilities: data.output.probabilities,
              });
              clearInterval(interval);
            } else if (data.status === 'deleted') {
              console.log("El modelo ha sido eliminado");
              setLoading(false);
              onNext();
            }
          })
          .catch((error) => {
            console.error("Error al obtener el estado del modelo:", error);
            setLoading(false);
            clearInterval(interval);
          });
      }, 5000); // Cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [loading, model_id, token, currentText]);

  const handleClassify = () => {
    if (result) {
      setHistory((prevHistory) => [
        ...prevHistory,
        {
          text: result.text,
          prediction: result.prediction,
          confidence: result.confidence,
          probabilities: result.probabilities,
        },
      ]);
    }
    setCurrentText(text);
    setText("");
    setStatus('IN_QUEUE');
    setLoading(true);

    predictText(text, model_id, token).catch((error) => {
      console.error("Error al enviar el texto para predicción:", error);
      setLoading(false);
    });
  };

  if (!modelData) return <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />;

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '80%', margin: '0 auto', padding: 2, pt: 10, gap: 3 }}>
      {/* Información del Modelo */}
      <Paper
        elevation={3}
        sx={{
          width: 250,
          padding: 2,
          backgroundColor: theme.palette.primary.light,
          borderRadius: 3,
          flexShrink: 0,
          alignSelf: 'flex-start',
        }}
      >
        <Typography variant="h6">Tu modelo</Typography>
        <Typography>Model id: {model_id}</Typography>
        <Typography>Accuracy: {(modelData.eval_accuracy * 100).toFixed(2)}%</Typography>
        <Typography>F1: {(modelData.eval_f1 * 100).toFixed(2)}%</Typography>
        <Typography>Loss: {modelData.eval_loss.toFixed(4)}</Typography>
        <Typography>Número de etiquetas: {modelData.num_labels}</Typography>
        <Typography>Creado: {new Date(modelData.created_at).toLocaleDateString()}</Typography>
        <Typography
          variant="body1"
          color="secondary"
          sx={{ mt: 2, cursor: 'pointer', textDecoration: 'underline' }}
          onClick={async () => {
            try {
              await deleteModel(model_id, token);
              onNext('loading', undefined, 'Eliminando el modelo...'); 
            } catch (error) {
              console.error('Error al eliminar el modelo:', error);
            } finally {
              setLoading(false);
            }
          }}
        >
          Quiero eliminar este modelo
        </Typography>
      </Paper>

      {/* Parte principal */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: 750,
        }}
      >
        {/* Entrada mensajes */}
        <Paper
          elevation={3}
          sx={{
            mb: 2,
            padding: 2,
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Box
            sx={{
              px: 2,
              borderRadius: 3,
              color: theme.palette.secondary.main,
              display: 'inline-block',
              mb: 5,
            }}
          >
            <Typography variant="h5" sx={{ mb: 0 }}>
              Inserta tu texto para predecir su autor
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              multiline
              maxRows={6}
              minRows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe tu mensaje..."
            />
            <IconButton color="secondary" onClick={handleClassify} aria-label="Enviar" size="large">
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>

        {/* El texto que se acaba de predecir */}
        <Typography variant="h5">Predicción de tu texto</Typography>

        <Paper
          sx={{
            padding: 2,
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
            mb: 5,
          }}
        >
          {loading ? (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                Estado:{' '}
                {status === 'IN_QUEUE'
                  ? 'En cola...'
                  : status === 'IN_PROGRESS'
                  ? 'Procesando...'
                  : status}
              </Typography>
              <LinearProgress variant="indeterminate" />
            </Box>
          ) : result ? (
            <>
              <Typography>"{result.text}"</Typography>
              <Typography variant="body2" color="text.secondary">
                {result.prediction} ({(result.confidence * 100).toFixed(1)}%)
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Introduce un texto y haz clic en enviar para ver la predicción.
            </Typography>
          )}
        </Paper>

        {/* Historial de predicciones */}
        <Typography variant="h5">Otras predicciones que has hecho</Typography>
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            paddingRight: 1,
            paddingBottom: 1,
            '&::-webkit-scrollbar': {
              width: '10px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: theme.palette.background.paper,
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.secondary.light,
              borderRadius: '10px',
              border: `2px solid ${theme.palette.background.paper}`,
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: theme.palette.secondary.dark,
            },
            scrollbarColor: `${theme.palette.secondary.light} ${theme.palette.background.paper}`,
            scrollbarWidth: 'thin',
          }}
        >
            {[...history].reverse().map((msg, index) => (
            <Paper
              key={index}
              sx={{
                padding: 2,
                borderRadius: 3,
                backgroundColor: theme.palette.primary.light,
              }}
            >
              <Typography>"{msg.text}"</Typography>
              <Typography variant="body2" color="text.secondary">
                {msg.prediction} ({(msg.confidence * 100).toFixed(1)}%)
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PredictModel;