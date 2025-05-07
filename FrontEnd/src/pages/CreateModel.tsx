import React, { useState, useEffect } from 'react';
import { 
  Box,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useTheme, Tooltip, IconButton, Button, Input } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomButton from "../components/Button.tsx"
import Papa from 'papaparse';

const CreateModel: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [columns, setColumns] = useState<string[]>([]);
  const [textColumn, setTextColumn] = useState<string>('');
  const [authorColumn, setAuthorColumn] = useState<string>('');
  const theme = useTheme();

  const handleFileUpload = (file: File) => {
    setLoading(true);
    Papa.parse(file, {
      complete: (result) => {
        console.log(result);
        console.log(result.meta);
        console.log(result.meta.fields);
        const csvColumns = result.meta.fields; 
        setColumns(csvColumns);
        setLoading(false);
      },
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true 
    });
  };


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
        <Typography variant="h3" component="h1">Sube tus datos
          <Tooltip title="Tienes que subir un archivo .csv que tenga al menos una columna con nombres u apodos de autores, y otra columna con el texto escrito por estos autores.">
            <IconButton size="small" sx={{ ml: 1 }}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        <p></p>
        {selectedFile ? (
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Typography variant="h6">{selectedFile.name}</Typography>
            <IconButton
              size="medium"
              color="error"
              onClick={() => setSelectedFile(null)}
            >
              <DeleteIcon fontSize="medium" />
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
                  handleFileUpload(file);
                }
              }}
            />
            <CustomButton variant="contained" component="span">
              Subir archivo .csv
            </CustomButton>
          </label>
        )}

        {selectedFile && (
          <>
            <p></p>
            <Box sx={{ mt: 2, width: '100%' }}>
              <FormControl fullWidth>
                <InputLabel>Selecciona la columna de textos</InputLabel>
                <Select
                  value={textColumn}
                  onChange={(e) => setTextColumn(e.target.value)}
                  label="Selecciona la columna de textos"
                  fullWidth
                >
                  {columns.map((column, index) => (
                    <MenuItem key={index} value={column}>
                      {column}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mt: 2, width: '100%' }}>
              <FormControl fullWidth>
                <InputLabel>Selecciona la columna de autores</InputLabel>
                <Select
                  value={authorColumn}
                  onChange={(e) => setAuthorColumn(e.target.value)}
                  label="Selecciona la columna de autores"
                  fullWidth
                >
                  {columns.map((column, index) => (
                    <MenuItem key={index} value={column}>
                      {column}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </>
        )}
        {selectedFile && textColumn && authorColumn ? 
          <>
            <p></p>
            <CustomButton
              disabled={!selectedFile}
              sx={{ mt: 3 }}
            >
              {'Crear modelo'}
            </CustomButton>
          </>
        : <></>
        }
        
      </Box>
    </Box>
  );
};

export default CreateModel;