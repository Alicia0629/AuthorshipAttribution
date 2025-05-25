import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { 
      main: '#a97ca5',
      light: '#c9a9ca',
    },
    secondary: { 
      main: '#7e5c74',
      dark: '#63455a',
      light: '#bd8ab9',
      contrastText: '#fff',
    },
    text: { 
      primary: '#333333',
      secondary: '#555555',
    },
    background: {
      default: '#d8c8db',
      paper: '#fdf5ff',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#333333' },
    secondary: { main: '#a97ca5',
                dark: '#8f748d'},
    text: { primary: '#fdf5ff' },
    background: {
      default: '#d8c8db',
      paper: '#5e3f56',
    },
  },
});

export { lightTheme, darkTheme };
