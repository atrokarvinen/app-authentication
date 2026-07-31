import { useMsal } from '@azure/msal-react'
import MicrosoftIcon from '@mui/icons-material/Microsoft'
import { Button, Stack, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { MICROSOFT_REDIRECT_URI } from './constants'

type Props = {
  clientId?: string
  onSignIn: (accessToken: string) => Promise<void>
}

const GRAPH_SCOPES = ['openid', 'profile', 'email', 'User.Read']

export const MicrosoftSignInButton = ({ clientId, onSignIn }: Props) => {
  const onSignInRef = useRef(onSignIn)
  const { instance } = useMsal()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    onSignInRef.current = onSignIn
  }, [onSignIn])

  if (!clientId) {
    return (
      <Button
        variant="outlined"
        size="large"
        startIcon={<MicrosoftIcon />}
        disabled
      >
        Microsoft sign-in unavailable
      </Button>
    )
  }

  const handleSignIn = async () => {
    setIsSigningIn(true)
    setErrorMessage(null)

    try {
      await instance.loginRedirect({
        redirectUri: MICROSOFT_REDIRECT_URI,
        redirectStartPage: MICROSOFT_REDIRECT_URI,
        scopes: GRAPH_SCOPES,
      })
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Microsoft sign-in failed.'
      )
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <Stack spacing={0.75}>
      <Button
        variant="outlined"
        size="large"
        startIcon={<MicrosoftIcon />}
        onClick={handleSignIn}
        disabled={isSigningIn}
        loading={isSigningIn}
      >
        Sign in with Microsoft
      </Button>
      {errorMessage ? (
        <Typography variant="caption" color="error">
          {errorMessage}
        </Typography>
      ) : null}
    </Stack>
  )
}
