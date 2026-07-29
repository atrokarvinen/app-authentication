import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { SubmitEvent } from 'react'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router'
import type { UserProfile } from '../../types/auth'
import styles from './RegistrationPage.module.css'

type RegistrationPageProps = {
  user: UserProfile | null
}

export const RegistrationPage = ({ user }: RegistrationPageProps) => {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      setShowSuccess(false)
      return
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.')
      setShowSuccess(false)
      return
    }

    setErrorMessage(null)
    setShowSuccess(true)
  }

  return (
    <Box className={styles.registrationShell}>
      <Paper elevation={0} className={styles.registrationPaper}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h3" className={styles.registrationTitle}>
              Create account
            </Typography>
            <Typography color="text.secondary">
              Register a new user profile. This is a frontend starter flow and
              can be connected to backend auth later.
            </Typography>
          </Box>

          {user ? (
            <Alert severity="info">
              You are currently logged in as {user.displayName}. You can still
              create another account.
            </Alert>
          ) : null}

          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          {showSuccess ? (
            <Alert
              icon={<CheckCircleOutlineIcon fontSize="inherit" />}
              severity="success"
            >
              Registration details accepted for {displayName || email}. Continue
              to login to sign in.
            </Alert>
          ) : null}

          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <TextField
              label="Display name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="name"
              required
              fullWidth
            />
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
              autoComplete="new-password"
              required
              fullWidth
            />
            <TextField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<PersonAddAlt1Icon />}
              >
                Register
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
              >
                Back to login
              </Button>
            </Stack>
          </Stack>

          <Typography color="text.secondary">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" underline="hover">
              Sign in
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}
