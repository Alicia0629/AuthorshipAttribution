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
    primary: {
      main: '#c778f7',
      light: '#0f021d',},
    secondary: { 
      main: '#8621c4',
      dark: '#391a5e',
      light: '#1b0633',
      contrastText: '#000',
    },
    text: {
      primary: '#dddddd',
      secondary: '#aaaaaa',},
    background: {
      default: '#000000',
      paper: '#281a3a',
    },
  },
});

export { lightTheme, darkTheme };
