import { Alert, Box, Link, Paper, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { LoginForm } from './LoginForm'
import styles from './LoginPage.module.css'

export const LoginPage = () => {
  const navigate = useNavigate()
  const {
    user,
    signInWithCredentials,
    signInWithGoogle,
    signInWithFacebook,
    signInWithMicrosoft,
  } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signInWithCredentials(email, password)
      setAuthError(null)
      navigate('/')
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Failed to sign in.'
      )
    }
  }

  const handleGoogleSignIn = async (accessToken: string) => {
    try {
      await signInWithGoogle(accessToken)
      setAuthError(null)
      navigate('/')
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : 'Failed to sign in with Google.'
      )
    }
  }

  const handleFacebookSignIn = async (accessToken: string) => {
    try {
      await signInWithFacebook(accessToken)
      setAuthError(null)
      navigate('/')
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : 'Failed to sign in with Facebook.'
      )
    }
  }

  const handleMicrosoftSignIn = async (accessToken: string) => {
    try {
      await signInWithMicrosoft(accessToken)
      setAuthError(null)
      navigate('/')
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : 'Failed to sign in with Microsoft.'
      )
    }
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
            onGoogleSignIn={handleGoogleSignIn}
            onFacebookSignIn={handleFacebookSignIn}
            onMicrosoftSignIn={handleMicrosoftSignIn}
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
