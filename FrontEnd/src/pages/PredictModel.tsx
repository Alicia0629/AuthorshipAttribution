import { Box, Typography, CircularProgress, IconButton, LinearProgress, useTheme, Paper, Divider, Button, TextField } from '@mui/material';
import { useEffect, useState } from "react";
import CustomButton from "../components/Button";
import SendIcon from '@mui/icons-material/Send';

interface PredictModelProps {
  model_id: string;
  onNext: () => void;
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
  label: string;
  confidence: number;
}

const getMockModelData = (): ModelData => {
  return {
    model_id: "model_1234abcd",
    status: "ready",
    num_labels: 5,
    eval_accuracy: 0.9123,
    eval_f1: 0.8888,
    eval_loss: 0.2034,
    created_at: new Date().toISOString(),
  };
};

const mockClassifyText = (text: string): PredictionResult => {
  // Respuesta simulada
  return {
    label: "positiva",
    confidence: 0.93,
  };
};

const PredictModel: React.FC<PredictModelProps> = ({ model_id, onNext }) => {
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const theme = useTheme();
  const history = [
    { text: "Hola, ¿cómo estás?", label: "positiva", confidence: 0.95 },
    { text: "No me gusta este clima", label: "negativa", confidence: 0.87 },
    { text: "Estoy neutral hoy", label: "neutral", confidence: 0.70 },
    { text: "Hola, ¿cómo estás?", label: "positiva", confidence: 0.95 },
    { text: "No me gusta este clima", label: "negativa", confidence: 0.87 },
    { text: "Estoy neutral hoy", label: "neutral", confidence: 0.70 },
    { text: "Hola, ¿cómo estás?", label: "positiva", confidence: 0.95 },
    { text: "No me gusta este clima", label: "negativa", confidence: 0.87 },
    { text: "Estoy neutral hoy", label: "neutral", confidence: 0.70 },
    { text: "Hola, ¿cómo estás?", label: "positiva", confidence: 0.95 },
    { text: "No me gusta este clima", label: "negativa", confidence: 0.87 },
    { text: "Estoy neutral hoy", label: "neutral", confidence: 0.70 },
  ];
  

  useEffect(() => {
    const data = getMockModelData();
    setModelData(data);
  }, []);

  const handleClassify = () => {
    if (!text.trim()) return;
    const prediction = mockClassifyText(text);
    setResult(prediction);
  };

  if (!modelData) return <p className="p-4">Cargando información del modelo...</p>;

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '80%', margin: '0 auto', padding: 2, pt:10, gap: 3 }}>
      
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
        <Typography>Accuracy: 91%</Typography>
        <Typography>F1: 88%</Typography>
        <Typography>Loss: 0.234</Typography>
        <Typography>Número de etiquetas: 5</Typography>
        <Typography>Creado: 7/5/25</Typography>
        <Typography
          variant="body1"
          color="secondary"
          sx={{ mt: 2, cursor: 'pointer', textDecoration: 'underline' }}
          onClick={onNext}
        >
          Quiero eliminar este modelo
        </Typography>

      </Paper>

      {/* Parte principal*/}
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
              mb:5
          }}>
            <Typography variant="h5" sx={{ mb: 0 }}>Inserta tu texto para predecir su autor</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              placeholder="Escribe tu mensaje..."
            />
            <IconButton
              color="secondary"
              onClick={handleClassify}
              aria-label="Enviar"
              size="large"
            >
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
                mb: 5
              }}
            >
              <Typography>"Mensaje"</Typography>
              <Typography variant="body2" color="text.secondary">
                ➡️ {"Positivo"} ({(0.75 * 100).toFixed(1)}%)
              </Typography>
          </Paper>

        <Typography variant='h5'>Otras predicciones que has hecho</Typography>
        {/* Historial del resto de textos */}
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


            // Para firefox
            scrollbarColor: `${theme.palette.secondary.light} ${theme.palette.background.paper}`,
            scrollbarWidth: 'thin',
          }}
        >{
          history.map((msg, index) => (
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
                ➡️ {msg.label} ({(msg.confidence * 100).toFixed(1)}%)
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PredictModel;