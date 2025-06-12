import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api.ts';
import CustomButton from "../components/Button.tsx"

import {
  TextField,
  Container,
  Typography,
  Link,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  useTheme,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';


const AuthForm: React.FC<{ onAuthSuccess: () => void }> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!isLogin) {
        await registerUser(email, password);
      }
      const response = await loginUser(email, password);
      localStorage.setItem('token', response.access_token);
      onAuthSuccess();
      navigate('/home');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm">
      
        <Typography variant="h5" component="h2" align="center" gutterBottom>
          {isLogin ? 'Iniciar sesión' : 'Registrar usuario'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <CustomButton
            type="submit"
            disabled={loading}
          >
            {(() => {
              if (loading) return <CircularProgress size={24} color="inherit" />;
              return isLogin ? 'Iniciar sesión' : 'Registrar';
            })()}
          </CustomButton>
        </form>

        <Divider sx={{ my: 2 }} />

        <Typography align="center">
          {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}{' '}
          <Link 
            component="button" 
            onClick={toggleAuthMode}
            sx={{ fontWeight: 'bold',
                  color: theme.palette.secondary.main }}
          >
            {isLogin ? 'Registrate aquí' : 'Inicia sesión aquí'}
          </Link>
        </Typography>
    </Container>
  );
};

export default AuthForm;