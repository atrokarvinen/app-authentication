import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined'
import { Button, Divider, Stack, TextField, Typography } from '@mui/material'
import type { SubmitEvent } from 'react'
import { useState } from 'react'
import { FacebookSignInButtonAlt } from '../../components/auth/FacebookSignInButtonAlt'
import { GoogleSignInButtonReactOAuth } from '../../components/auth/GoogleSignInButton'
import { MicrosoftSignInButton } from '../../components/auth/MicrosoftSignInButton'
import styles from './LoginForm.module.css'

type LoginFormProps = {
  onSignIn: (email: string, password: string) => Promise<void>
  onGoogleSignIn: (accessToken: string) => Promise<void>
  onFacebookSignIn: (accessToken: string) => Promise<void>
  onMicrosoftSignIn: (accessToken: string) => Promise<void>
}

export const LoginForm = ({
  onSignIn,
  onGoogleSignIn,
  onFacebookSignIn,
  onMicrosoftSignIn,
}: LoginFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsSubmitting(true)

    try {
      await onSignIn(email, password)
      setPassword('')
    } finally {
      setIsSubmitting(false)
    }
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
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          Sign in
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Divider className={styles.growDivider} />
        <Typography variant="body2" color="text.secondary">
          or continue with
        </Typography>
        <Divider className={styles.growDivider} />
      </Stack>

      <Stack spacing={1.5}>
        <GoogleSignInButtonReactOAuth
          clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
          onSignIn={onGoogleSignIn}
        />
        <FacebookSignInButtonAlt
          appId={import.meta.env.VITE_FACEBOOK_APP_ID}
          onSignIn={onFacebookSignIn}
        />
        <MicrosoftSignInButton
          clientId={import.meta.env.VITE_MICROSOFT_CLIENT_ID}
          onSignIn={onMicrosoftSignIn}
        />
      </Stack>
    </>
  )
}
