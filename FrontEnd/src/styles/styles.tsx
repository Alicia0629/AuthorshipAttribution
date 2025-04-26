import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#a97ca5' },
    secondary: { main: '#7e5c74',
                dark: '#63455a'},
    text: { primary: '#333333' },
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
