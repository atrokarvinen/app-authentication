import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined'
import { Alert, Box, Link, Paper, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router'
import type { AuthProvider, UserProfile } from '../../types/auth'
import { LoginForm } from './LoginForm'
import styles from './LoginPage.module.css'

type LoginPageProps = {
  user: UserProfile | null
  onSignIn: (email: string) => void
  onProviderSignIn: (provider: AuthProvider) => void
}

export const LoginPage = ({
  user,
  onSignIn,
  onProviderSignIn,
}: LoginPageProps) => {
  const navigate = useNavigate()
  const [showRegisterHint, setShowRegisterHint] = useState(false)

  const handleSignIn = (email: string) => {
    onSignIn(email)
    navigate('/')
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

          <LoginForm
            onSignIn={handleSignIn}
            onProviderSignIn={handleProviderSignIn}
          />

          <Typography color="text.secondary">
            Need an account?{' '}
            <Link
              component={RouterLink}
              to="/login"
              underline="hover"
              onClick={() => setShowRegisterHint(true)}
            >
              Go to registration
            </Link>
          </Typography>

          {showRegisterHint ? (
            <Alert
              icon={<HowToRegOutlinedIcon fontSize="inherit" />}
              severity="success"
            >
              Registration is the next page to implement. This link is wired as
              the placeholder handoff.
            </Alert>
          ) : null}
        </Stack>
      </Paper>
    </Box>
  )
}