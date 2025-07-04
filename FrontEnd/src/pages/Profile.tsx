import React, { useState, useEffect } from 'react';
import { 
  Box,
  Typography,
  Paper,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import { getUserProfile } from '../services/api.ts';
import { Lock as LockIcon } from '@mui/icons-material';
import LoadingOrError from '../components/LoadingOrError';

interface User {
  id: number;
  email: string;
  full_name?: string;
  created_at?: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No hay sesión activa');
          return;
        }

        const profileData = await getUserProfile(token);
        setUser(profileData);
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
      <Box sx={{ maxWidth: 600, mx: 'auto', my: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Perfil de Usuario
          </Typography>
          <Divider sx={{ my: 2 }} />

          {user ? (
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <LockIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Email" secondary={user.email} />
              </ListItem>

              {user.full_name && (
                <ListItem>
                  <ListItemText primary="Nombre completo" secondary={user.full_name} />
                </ListItem>
              )}

              {user.created_at && (
                <ListItem>
                  <ListItemText
                    primary="Miembro desde"
                    secondary={new Date(user.created_at).toLocaleDateString()}
                  />
                </ListItem>
              )}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No se encontraron datos del usuario
            </Typography>
          )}
        </Paper>
      </Box>
    </LoadingOrError>
  );
};

export default Profile;