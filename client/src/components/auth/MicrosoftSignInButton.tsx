import { useMsal } from '@azure/msal-react'
import MicrosoftIcon from '@mui/icons-material/Microsoft'
import { Button, Stack, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

type Props = {
  clientId?: string
  onSignIn: (accessToken: string) => Promise<void>
}

const GRAPH_SCOPES = ['openid', 'profile', 'email', 'User.Read']
const MICROSOFT_POPUP_REDIRECT_URI = import.meta.env.VITE_MICROSOFT_REDIRECT_URI

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

  const handleSignInRedirect = async () => {
    setIsSigningIn(true)
    setErrorMessage(null)

    try {
      await instance.acquireTokenRedirect({
        redirectUri: MICROSOFT_POPUP_REDIRECT_URI,
        scopes: GRAPH_SCOPES,
      })
      // await instance.loginRedirect({
      //   redirectUri: MICROSOFT_POPUP_REDIRECT_URI,
      //   scopes: GRAPH_SCOPES,
      // })
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Microsoft sign-in failed.'
      )
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSignInPopup = async () => {
    setIsSigningIn(true)
    setErrorMessage(null)

    try {
      const authResult = await instance.acquireTokenPopup({
        scopes: GRAPH_SCOPES,
        prompt: 'select_account',
        redirectUri: MICROSOFT_POPUP_REDIRECT_URI,
      })

      console.log('Microsoft sign-in successful:', authResult)

      if (!authResult.accessToken) {
        throw new Error('Microsoft sign-in did not return an access token.')
      }

      await onSignInRef.current(authResult.accessToken)
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
        onClick={handleSignInPopup}
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
