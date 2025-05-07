import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  Tooltip,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import { deleteUserAccount } from '../services/api';

const TopBarMenu: React.FC<{ onLogOutSuccess: () => void }> = ({ onLogOutSuccess }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogOutSuccess();
    navigate('/login');
  };
  const handleDeleteAccount = async () => {
    handleClose();
    const confirm = window.confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.');
    if (confirm) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await deleteUserAccount(token);
          handleLogout();
        }
      } catch (error) {
        alert(error.message);
        console.error(error);
      }
    }
  };
  

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1300,
      }}
    >
      <Tooltip title="Opciones">
        <IconButton
          onClick={handleClick}
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.background.paper,
            boxShadow: 4,
            '&:hover': {
              backgroundColor: theme.palette.secondary.main,
            },
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      >
        <MenuItem onClick={() => { handleClose(); handleDeleteAccount(); }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Eliminar cuenta
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); handleLogout(); }}>
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
          Cerrar sesión
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default TopBarMenu;