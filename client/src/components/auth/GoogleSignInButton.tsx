import GoogleIcon from '@mui/icons-material/Google'
import { Button, Stack, Typography } from '@mui/material'
import { useGoogleLogin } from '@react-oauth/google'
import { useEffect, useRef, useState } from 'react'

type Props = {
  clientId?: string
  onSignIn: (accessToken: string) => Promise<void>
}

type InnerProps = {
  onSignIn: (accessToken: string) => Promise<void>
}

const GoogleSignInButtonReactOAuthInner = ({ onSignIn }: InnerProps) => {
  const onSignInRef = useRef(onSignIn)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    onSignInRef.current = onSignIn
  }, [onSignIn])

  const login = useGoogleLogin({
    scope: 'openid email profile',
    onSuccess: async (tokenResponse) => {
      if (!tokenResponse.access_token) {
        setIsSigningIn(false)
        setErrorMessage('Google sign-in did not return an access token.')
        return
      }

      try {
        await onSignInRef.current(tokenResponse.access_token)
        setErrorMessage(null)
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Google sign-in failed.'
        )
      } finally {
        setIsSigningIn(false)
      }
    },
    onError: () => {
      setIsSigningIn(false)
      setErrorMessage('Google sign-in was cancelled.')
    },
    onNonOAuthError: () => {
      setIsSigningIn(false)
      setErrorMessage('Google sign-in failed to start.')
    },
  })

  const handleSignIn = () => {
    setErrorMessage(null)
    setIsSigningIn(true)
    login()
  }

  return (
    <Stack spacing={0.75}>
      <Button
        variant="outlined"
        size="large"
        startIcon={<GoogleIcon />}
        onClick={handleSignIn}
        disabled={isSigningIn}
        loading={isSigningIn}
      >
        Sign in with Google
      </Button>
      {errorMessage ? (
        <Typography variant="caption" color="error">
          {errorMessage}
        </Typography>
      ) : null}
    </Stack>
  )
}

export const GoogleSignInButtonReactOAuth = ({ clientId, onSignIn }: Props) => {
  if (!clientId) {
    return (
      <Button
        variant="outlined"
        size="large"
        startIcon={<GoogleIcon />}
        disabled
      >
        Google sign-in (react-oauth/google) unavailable
      </Button>
    )
  }

  return <GoogleSignInButtonReactOAuthInner onSignIn={onSignIn} />
}
