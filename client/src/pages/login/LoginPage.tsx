import { Alert, Box, Link, Paper, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router'
import type { AuthProvider, UserProfile } from '../../types/auth'
import { LoginForm } from './LoginForm'
import styles from './LoginPage.module.css'

type LoginPageProps = {
  user: UserProfile | null
  onSignIn: (email: string, password: string) => Promise<void>
  onProviderSignIn: (provider: AuthProvider) => void
}

export const LoginPage = ({
  user,
  onSignIn,
  onProviderSignIn,
}: LoginPageProps) => {
  const navigate = useNavigate()
  const [authError, setAuthError] = useState<string | null>(null)

  const handleSignIn = async (email: string, password: string) => {
    try {
      await onSignIn(email, password)
      setAuthError(null)
      navigate('/')
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Failed to sign in.'
      )
    }
  }

  const handleProviderSignIn = (provider: AuthProvider) => {
    onProviderSignIn(provider)
    navigate('/')
  }

  return (
    <Box className={styles.loginPageShell}>
      <Paper elevation={0} className={styles.loginPaper}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h3" className={styles.loginTitle}>
              Login
            </Typography>
            <Typography color="text.secondary">
              Sign in with your email and password or continue with a social
              provider.
            </Typography>
          </Box>

          {user ? (
            <Alert severity="info">
              Signed in as {user.displayName}. Logging in again will replace the
              current local session.
            </Alert>
          ) : null}

          {authError ? <Alert severity="error">{authError}</Alert> : null}

          <LoginForm
            onSignIn={handleSignIn}
            onProviderSignIn={handleProviderSignIn}
          />

          <Typography color="text.secondary">
            Need an account?{' '}
            <Link component={RouterLink} to="/register" underline="hover">
              Go to registration
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}
