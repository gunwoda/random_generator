import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a73e8', // Google Blue
    },
    background: {
      default: '#f8f9fa', // Light gray background
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)', // Google Keep style shadow
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Google prefers no text transform
          borderRadius: 20, // Rounded pill buttons
        },
      },
    },
  },
});

export default theme;
