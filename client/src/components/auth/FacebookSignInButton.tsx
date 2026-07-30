import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded'
import { Button, Stack, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

const CALLBACK_PATH = '/auth/facebook/callback'
const POPUP_FEATURES = 'width=600,height=700,left=400,top=100'

type FacebookOAuthMessage = {
  type: 'facebook-oauth-callback'
  state: string
  code?: string
  error?: string
}

type Props = {
  appId?: string
  onSignIn: (code: string) => Promise<void>
}

export const FacebookSignInButton = ({ appId, onSignIn }: Props) => {
  const onSignInRef = useRef(onSignIn)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    onSignInRef.current = onSignIn
  }, [onSignIn])

  if (!appId) {
    return null
  }

  const handleClick = () => {
    const state = crypto.randomUUID()
    const redirectUri = `${window.location.origin}${CALLBACK_PATH}`

    const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth')
    authUrl.searchParams.set('client_id', appId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', 'public_profile,email')
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('response_type', 'code')

    const popup = window.open(authUrl, 'facebook-login', POPUP_FEATURES)

    if (!popup) {
      setErrorMessage('Pop-up was blocked. Please allow pop-ups for this site.')
      return
    }

    setIsSigningIn(true)
    setErrorMessage(null)

    const handleMessage = async (event: MessageEvent<FacebookOAuthMessage>) => {
      if (
        event.origin !== window.location.origin ||
        event.data?.type !== 'facebook-oauth-callback' ||
        event.data.state !== state
      ) {
        return
      }

      window.removeEventListener('message', handleMessage)

      if (event.data.error || !event.data.code) {
        setIsSigningIn(false)
        setErrorMessage('Facebook sign-in was cancelled.')
        return
      }

      try {
        await onSignInRef.current(event.data.code)
        setErrorMessage(null)
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Facebook sign-in failed.'
        )
      } finally {
        setIsSigningIn(false)
      }
    }

    window.addEventListener('message', handleMessage)

    // Clean up listener if user closes the popup without completing sign-in
    const pollClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollClosed)
        window.removeEventListener('message', handleMessage)
        setIsSigningIn((prev) => {
          if (prev) setErrorMessage('Facebook sign-in was cancelled.')
          return false
        })
      }
    }, 500)
  }

  return (
    <Stack spacing={0.5}>
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
