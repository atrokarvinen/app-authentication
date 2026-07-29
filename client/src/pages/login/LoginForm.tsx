import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded'
import GoogleIcon from '@mui/icons-material/Google'
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined'
import MicrosoftIcon from '@mui/icons-material/Microsoft'
import { Button, Divider, Stack, TextField, Typography } from '@mui/material'
import type { SubmitEvent } from 'react'
import { useState } from 'react'
import type { AuthProvider } from '../../types/auth'
import styles from './LoginForm.module.css'

type LoginFormProps = {
  onSignIn: (email: string) => void
  onProviderSignIn: (provider: AuthProvider) => void
}

export const LoginForm = ({ onSignIn, onProviderSignIn }: LoginFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSignIn(email)
    setPassword('')
  }

  return (
    <>
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
          onClick={() => onProviderSignIn('Google')}
        >
          Sign in with Google
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<FacebookRoundedIcon />}
          onClick={() => onProviderSignIn('Facebook')}
        >
          Sign in with Facebook
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<MicrosoftIcon />}
          onClick={() => onProviderSignIn('Microsoft')}
        >
          Sign in with Microsoft
        </Button>
      </Stack>
    </>
  )
}
