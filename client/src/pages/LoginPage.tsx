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
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router'
import type { AuthProvider, UserProfile } from '../types/auth'

type LoginPageProps = {
  user: UserProfile | null
  onSignIn: (email: string) => void
  onProviderSignIn: (provider: AuthProvider) => void
}

export function LoginPage({
  user,
  onSignIn,
  onProviderSignIn,
}: LoginPageProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showRegisterHint, setShowRegisterHint] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSignIn(email)
    setPassword('')
    navigate('/')
  }

  function handleProviderSignIn(provider: AuthProvider) {
    onProviderSignIn(provider)
    navigate('/')
  }

  return (
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        minHeight: { md: 'calc(100vh - 210px)' },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 560,
          p: { xs: 3, md: 4 },
          borderRadius: 6,
          border: '1px solid',
          borderColor: 'divider',
          background:
            'linear-gradient(180deg, rgba(255,250,240,0.96) 0%, rgba(248,244,236,0.9) 100%)',
          boxShadow: '0 24px 60px rgba(71, 49, 17, 0.12)',
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h3"
              sx={{ fontFamily: "Georgia, 'Times New Roman', serif", mb: 1.5 }}
            >
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
            <Divider sx={{ flex: 1 }} />
            <Typography variant="body2" color="text.secondary">
              or continue with
            </Typography>
            <Divider sx={{ flex: 1 }} />
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
