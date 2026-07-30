import GoogleIcon from '@mui/icons-material/Google'
import { Button, Stack, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

type GoogleTokenClient = {
  requestAccessToken: () => void
}

type GoogleIdentityServices = {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string
        scope: string
        callback: (response: GoogleTokenResponse) => void
      }) => GoogleTokenClient
    }
  }
}

type GoogleTokenResponse = {
  access_token?: string
  error?: string
  error_description?: string
}

declare global {
  interface Window {
    google?: GoogleIdentityServices
  }
}

type GoogleSignInButtonProps = {
  clientId?: string
  onSignIn: (accessToken: string) => Promise<void>
}

const GOOGLE_SCRIPT_ID = 'google-identity-services-client'
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

export const GoogleSignInButton = ({
  clientId,
  onSignIn,
}: GoogleSignInButtonProps) => {
  const tokenClientRef = useRef<GoogleTokenClient | null>(null)
  const onSignInRef = useRef(onSignIn)
  const [isLoadingScript, setIsLoadingScript] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    onSignInRef.current = onSignIn
  }, [onSignIn])

  useEffect(() => {
    if (!clientId) {
      setErrorMessage('Google sign-in is not configured.')
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    let isCancelled = false

    const initializeClient = () => {
      if (!window.google || !clientId || isCancelled) {
        return
      }

      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (response) => {
          if (response.error) {
            setIsSigningIn(false)
            setErrorMessage(
              response.error_description || 'Google sign-in was cancelled.'
            )
            return
          }

          if (!response.access_token) {
            setIsSigningIn(false)
            setErrorMessage('Google sign-in did not return an access token.')
            return
          }

          try {
            await onSignInRef.current(response.access_token)
            setErrorMessage(null)
          } catch (error) {
            setErrorMessage(
              error instanceof Error ? error.message : 'Google sign-in failed.'
            )
          } finally {
            setIsSigningIn(false)
          }
        },
      })

      setIsLoadingScript(false)
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID)

    if (existingScript) {
      if (window.google) {
        initializeClient()
      } else {
        existingScript.addEventListener('load', initializeClient, {
          once: true,
        })
      }

      return () => {
        isCancelled = true
      }
    }

    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = GOOGLE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => {
      if (!isCancelled) {
        initializeClient()
      }
    }
    script.onerror = () => {
      if (!isCancelled) {
        setIsLoadingScript(false)
        setErrorMessage('Failed to load Google sign-in.')
      }
    }

    document.head.append(script)
    setIsLoadingScript(true)

    return () => {
      isCancelled = true
      script.onload = null
      script.onerror = null
    }
  }, [clientId])

  const handleGoogleSignIn = () => {
    setErrorMessage(null)

    if (!clientId) {
      setErrorMessage('Google sign-in is not configured.')
      return
    }

    if (!tokenClientRef.current) {
      setErrorMessage('Google sign-in is still loading. Please try again.')
      return
    }

    setIsSigningIn(true)
    tokenClientRef.current.requestAccessToken()
  }

  return (
    <Stack spacing={0.75}>
      <Button
        variant="outlined"
        size="large"
        startIcon={<GoogleIcon />}
        onClick={handleGoogleSignIn}
        disabled={isLoadingScript || isSigningIn || !clientId}
        loading={isLoadingScript || isSigningIn}
      >
        {clientId ? 'Sign in with Google' : 'Google sign-in unavailable'}
      </Button>
      {errorMessage ? (
        <Typography variant="caption" color="error">
          {errorMessage}
        </Typography>
      ) : null}
    </Stack>
  )
}
