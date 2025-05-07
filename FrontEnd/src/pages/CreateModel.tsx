import React, { useState, useEffect } from 'react';
import { 
  Box,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
} from '@mui/material';
import { useTheme, Tooltip, IconButton, Button, Input } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import TopBar from "../components/TopBar";
import CustomButton from "../components/Button.tsx"

const CreateModel: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [textColumn, setTextColumn] = useState<string>('');
  const [authorColumn, setAuthorColumn] = useState<string>('');
  const theme = useTheme();

  useEffect(() => {
    
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No hay sesión activa');
          return;
        }

        //TODO: Mirar si usuario ya tiene un modelo

      } catch (err) {
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', my: 4 }}>
      <TopBar />
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
        <Typography variant="h5" component="h2" align="center" gutterBottom>
          Crea un modelo de atribución de autoría
        </Typography>
        <p>Sube tus datos
          <Tooltip title="Tienes que subir un archivo .csv que tenga al menos una columna con nombres u apodos de autores, y otra columna con el texto escrito por estos autores.">
            <IconButton size="small" sx={{ ml: 1 }}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </p>
        {selectedFile ? (
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Typography variant="body2">{selectedFile.name}</Typography>
            <IconButton
              size="small"
              color="error"
              onClick={() => setSelectedFile(null)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <label htmlFor="csv-upload">
            <Input
              type="file"
              inputProps={{ accept: '.csv' }}
              id="csv-upload"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                }
              }}
            />
            <Button variant="contained" component="span">
              Subir archivo .csv
            </Button>
          </label>
        )}
        <p></p>
        {selectedFile && (
          <>
            <Box sx={{ mt: 2, width: '100%' }}>
              <Typography variant="body2">Columna de textos:</Typography>
              <Input
                value={textColumn}
                onChange={(e) => setTextColumn(e.target.value)}
                fullWidth
                placeholder="Escribe el nombre de la columna de textos"
              />
            </Box>
            <Box sx={{ mt: 2, width: '100%' }}>
              <Typography variant="body2">Columna de autores:</Typography>
              <Input
                value={authorColumn}
                onChange={(e) => setAuthorColumn(e.target.value)}
                fullWidth
                placeholder="Escribe el nombre de la columna de autores"
              />
            </Box>
          </>
        )}
        <p></p>
        <CustomButton
            disabled={!selectedFile}
            sx={{ mt: 3 }}
        >
          {'Crear modelo'}
        </CustomButton>
      </Box>
    </Box>
  );
};

export default CreateModel;