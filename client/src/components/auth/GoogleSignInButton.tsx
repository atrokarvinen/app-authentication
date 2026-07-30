import GoogleIcon from '@mui/icons-material/Google'
import { Button, Stack, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import type { GoogleTokenClient } from './types'
import { useGoogleIdentityScript } from './useGoogleIdentityScript'

type Props = {
  clientId?: string
  onSignIn: (accessToken: string) => Promise<void>
}

export const GoogleSignInButton = ({ clientId, onSignIn }: Props) => {
  const tokenClientRef = useRef<GoogleTokenClient | null>(null)
  const onSignInRef = useRef(onSignIn)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { isLoadingScript, isScriptReady } = useGoogleIdentityScript({
    enabled: Boolean(clientId),
    onScriptError: setErrorMessage,
  })

  useEffect(() => {
    onSignInRef.current = onSignIn
  }, [onSignIn])

  useEffect(() => {
    if (!clientId || !isScriptReady || !window.google) {
      tokenClientRef.current = null
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
  }, [clientId, isScriptReady])

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
