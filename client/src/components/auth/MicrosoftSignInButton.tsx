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
  const { instance, accounts } = useMsal()
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
      const authResult = await instance.loginPopup({ scopes: GRAPH_SCOPES })

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

  const test = async () => {
    console.log('Microsoft sign-in test:', accounts)
    if (accounts.length > 0) {
      try {
        const authResult = await instance.acquireTokenSilent({
          scopes: GRAPH_SCOPES,
          account: accounts[0],
        })

        console.log('Microsoft token acquired silently:', authResult)

        if (!authResult.accessToken) {
          throw new Error(
            'Microsoft token acquisition did not return an access token.'
          )
        }

        await onSignInRef.current(authResult.accessToken)
        return
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Microsoft token acquisition failed.'
        )
      }
    } else {
      setErrorMessage('No Microsoft account is currently signed in.')
    }

    const account = instance.getActiveAccount()
    if (account) {
      try {
        const authResult = await instance.acquireTokenSilent({
          scopes: GRAPH_SCOPES,
          account: account,
        })

        console.log(
          'Microsoft token acquired silently for active account:',
          authResult
        )

        if (!authResult.accessToken) {
          throw new Error(
            'Microsoft token acquisition did not return an access token.'
          )
        }

        await onSignInRef.current(authResult.accessToken)
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Microsoft token acquisition failed.'
        )
      }
    }
  }

  return (
    <Stack spacing={0.75}>
      <Button
        onClick={() => {
          test()
        }}
      >
        Test
      </Button>
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
