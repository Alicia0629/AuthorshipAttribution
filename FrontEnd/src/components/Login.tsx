import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box, 
  Link, 
  Divider,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const AuthForm: React.FC<{ onAuthSuccess: () => void }> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string>('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      navigate('/profile');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
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
          {isLogin ? 'Login' : 'Register'}
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
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePassword}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
          </Button>
        </form>

        <Divider sx={{ my: 2 }} />

        <Typography align="center">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <Link 
            component="button" 
            onClick={toggleAuthMode}
            sx={{ fontWeight: 'bold' }}
          >
            {isLogin ? 'Register here' : 'Login here'}
          </Link>
        </Typography>
    </Container>
  );
};

export default AuthForm;