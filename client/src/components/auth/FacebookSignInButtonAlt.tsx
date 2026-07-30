import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded'
import { Button, Stack, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

type Props = {
  appId?: string
  onSignIn: (code: string) => Promise<void>
}

export const FacebookSignInButtonAlt = ({ appId, onSignIn }: Props) => {
  const onSignInRef = useRef(onSignIn)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    onSignInRef.current = onSignIn
  }, [onSignIn])

  useEffect(() => {
    if (window.FB) return
    if (!appId) return
    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.onload = () => {
      if (!window.FB) return
      window.FB.init({
        appId,
        xfbml: true,
        version: 'v26.0',
      })
    }
    document.body.appendChild(script)
  }, [appId])

  const handleClick = () => {
    if (!appId) return

    const FB = window.FB
    if (!FB) {
      setErrorMessage('Facebook SDK not loaded. Please try again later.')
      return
    }

    setIsSigningIn(true)
    setErrorMessage(null)

    FB.login(
      (response) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken
          onSignInRef.current(accessToken)
        } else {
          setErrorMessage('Facebook login failed or was cancelled.')
        }
        setIsSigningIn(false)
      },
      { scope: 'public_profile,email' }
    )
  }

  if (!appId) return null
  return (
    <Stack spacing={0.5}>
      <a
        href={`https://www.facebook.com/v26.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/facebook/callback')}&state=test`}
        style={{ textDecoration: 'none' }}
      >
        Login with Facebook
      </a>
      <Button
        variant="outlined"
        size="large"
        startIcon={<FacebookRoundedIcon />}
        onClick={handleClick}
        disabled={isSigningIn}
        loading={isSigningIn}
      >
        Sign in with Facebook
      </Button>
      {errorMessage && (
        <Typography variant="caption" color="error">
          {errorMessage}
        </Typography>
      )}
    </Stack>
  )
}
