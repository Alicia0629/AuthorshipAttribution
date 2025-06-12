import React, { useState, useEffect } from 'react';
import { 
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Tooltip,
  IconButton,
  Input
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomButton from "../components/Button.tsx"
import Papa from 'papaparse';
import { sendModelData } from '../services/api.ts'
import LoadingOrError from '../components/LoadingOrError';


const FileDetails: React.FC<{ selectedFile: File; onRemove: () => void }> = ({
  selectedFile,
  onRemove,
}) => (
  <Box display="flex" alignItems="center" gap={1} mt={1}>
    <Typography variant="h6">{selectedFile.name}</Typography>
    <IconButton size="medium" color="error" onClick={onRemove}>
      <DeleteIcon fontSize="medium" />
    </IconButton>
  </Box>
);

const FileUpload: React.FC<{ onFileSelect: (file: File) => void }> = ({
  onFileSelect,
}) => (
  <label htmlFor="csv-upload">
    <Input
      type="file"
      inputProps={{ accept: '.csv' }}
      id="csv-upload"
      style={{ display: 'none' }}
      onChange={(e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          onFileSelect(file);
        }
      }}
    />
    <CustomButton variant="contained" component="span">
      Subir archivo .csv
    </CustomButton>
  </label>
);

const ColumnSelector: React.FC<{
  columns: string[];
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ columns, label, value, onChange }) => (
  <Box sx={{ mt: 2, width: '100%' }}>
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select value={value} onChange={(e) => onChange(e.target.value)} label={label} fullWidth>
        {columns.map((column, index) => (
          <MenuItem key={index} value={column}>
            {column}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Box>
);


interface CreateModelProps {
  onNext: (modelId: string) => void;
}

type CsvRow = {
  [key: string]: string | number | null;
};

const CreateModel: React.FC<CreateModelProps> = ({ onNext }) => {
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
      complete: handleParseComplete,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
  };

  const handleParseComplete = (result: Papa.ParseResult<CsvRow>) => {
    const csvColumns = result.meta.fields || [];
    setColumns(csvColumns);
    setLoading(false);
  };

  const handleCreateModel = async () => {
    if (!selectedFile || !textColumn || !authorColumn) return;

    const reader = new FileReader();
    reader.onload = () => processCsv(reader.result as string);
    reader.readAsText(selectedFile);
  };

  const processCsv = (csvText: string) => {
    Papa.parse<CsvRow>(csvText, {
      header: true,
      complete: (results) => handleCsvComplete(results, csvText),
    });
  };

  const handleCsvComplete = (results: Papa.ParseResult<CsvRow>, csvText: string) => {
    const labels = results.data.map((row) => row[authorColumn] as string);
    const uniqueLabels = Array.from(new Set(labels)).filter(Boolean);

    const base64File = btoa(encodeURIComponent(csvText));
    const token = localStorage.getItem('token');

    if (token) {
      const payload = {
        file: base64File,
        text_column: textColumn,
        label_column: authorColumn,
        num_labels: uniqueLabels.length,
      };

      sendModelData(payload, token)
        .then((response) => {
          console.log('Response from sendModelData:', response);
          console.log('Model ID:', response.model_id);
          onNext(response.model_id);
        })
        .catch((error) => {
          console.error('Error sending model data:', error);
        });
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No hay sesión activa');
          return;
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <LoadingOrError loading={loading} error={error}>
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
          <Typography variant="h3" component="h1">
            Sube tus datos
            <Tooltip title="Tienes que subir un archivo .csv que tenga al menos una columna con nombres u apodos de autores, y otra columna con el texto escrito por estos autores.">
              <IconButton size="small" sx={{ ml: 1 }}>
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          <p></p>
          {selectedFile ? (
            <FileDetails
              selectedFile={selectedFile}
              onRemove={() => setSelectedFile(null)}
            />
          ) : (
            <FileUpload onFileSelect={handleFileUpload} />
          )}
          {selectedFile && (
            <>
              <ColumnSelector
                columns={columns}
                label="Selecciona la columna de textos"
                value={textColumn}
                onChange={setTextColumn}
              />
              <ColumnSelector
                columns={columns}
                label="Selecciona la columna de autores"
                value={authorColumn}
                onChange={setAuthorColumn}
              />
            </>
          )}
          {selectedFile && textColumn && authorColumn && (
            <CustomButton
              disabled={!selectedFile}
              sx={{ mt: 3 }}
              onClick={handleCreateModel}
            >
              Crear modelo
            </CustomButton>
          )}
        </Box>
      </Box>
    </LoadingOrError>
  );
};

export default CreateModel;
