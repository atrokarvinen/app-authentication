import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { theme } from './theme'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
const microsoftClientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID
const microsoftRedirectUri = import.meta.env.VITE_MICROSOFT_REDIRECT_URI

console.log('microsoftClientId', microsoftClientId)
console.log('microsoftRedirectUri', microsoftRedirectUri)

const microsoftAuthInstance = new PublicClientApplication({
  auth: {
    clientId: microsoftClientId || '00000000-0000-0000-0000-000000000000',
    authority:
      import.meta.env.VITE_MICROSOFT_AUTHORITY ||
      'https://login.microsoftonline.com/common',
    redirectUri: microsoftRedirectUri,
  },
  cache: { cacheLocation: 'localStorage' },
})

const appTree = (
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)

const treeWithGoogle = (
  <GoogleOAuthProvider clientId={googleClientId}>{appTree}</GoogleOAuthProvider>
)

createRoot(document.getElementById('root')!).render(
  <MsalProvider instance={microsoftAuthInstance}>{treeWithGoogle}</MsalProvider>
)
