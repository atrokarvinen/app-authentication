import { createTheme } from '@mui/material'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#8f5a2a',
    },
    secondary: {
      main: '#476c5e',
    },
    background: {
      default: '#f6efe3',
      paper: '#fffaf0',
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: "Aptos, 'Segoe UI Variable', 'Trebuchet MS', sans-serif",
    h1: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontWeight: 700,
      lineHeight: 0.95,
      fontSize: 'clamp(2.8rem, 4vw, 4.9rem)',
    },
    h5: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontWeight: 700,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': {
          boxSizing: 'border-box',
        },
        ':root': {
          fontSynthesis: 'none',
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        body: {
          margin: 0,
          minWidth: 320,
          minHeight: '100vh',
          background:
            'radial-gradient(circle at top left, rgba(245, 196, 126, 0.38), transparent 28%), radial-gradient(circle at right 20%, rgba(213, 233, 216, 0.72), transparent 26%), linear-gradient(180deg, #f6efe3 0%, #f8f4ec 48%, #efe2cf 100%)',
        },
        '#root': {
          minHeight: '100vh',
        },
        'button, input, textarea, select': {
          font: 'inherit',
        },
        a: {
          color: 'inherit',
        },
      },
    },
  },
})