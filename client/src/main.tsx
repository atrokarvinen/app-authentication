import { CssBaseline, ThemeProvider } from '@mui/material'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.tsx'
import { theme } from './theme'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

const appTree = (
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={googleClientId}>{appTree}</GoogleOAuthProvider>
)
