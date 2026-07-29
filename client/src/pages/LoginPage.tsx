import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded'
import GoogleIcon from '@mui/icons-material/Google'
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined'
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined'
import MicrosoftIcon from '@mui/icons-material/Microsoft'
import {
  Alert,
  Box,
  Button,
  Divider,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { SubmitEvent } from 'react'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router'
import type { AuthProvider, UserProfile } from '../types/auth'
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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showRegisterHint, setShowRegisterHint] = useState(false)

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSignIn(email)
    setPassword('')
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

          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<LoginOutlinedIcon />}
            >
              Sign in
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Divider className={styles.growDivider} />
            <Typography variant="body2" color="text.secondary">
              or continue with
            </Typography>
            <Divider className={styles.growDivider} />
          </Stack>

          <Stack spacing={1.5}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={() => handleProviderSignIn('Google')}
            >
              Sign in with Google
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<FacebookRoundedIcon />}
              onClick={() => handleProviderSignIn('Facebook')}
            >
              Sign in with Facebook
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<MicrosoftIcon />}
              onClick={() => handleProviderSignIn('Microsoft')}
            >
              Sign in with Microsoft
            </Button>
          </Stack>

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
