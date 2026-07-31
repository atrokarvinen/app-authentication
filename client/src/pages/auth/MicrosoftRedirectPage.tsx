import { useMsal } from '@azure/msal-react'
import { CircularProgress } from '@mui/material'
import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'

export const MicrosoftRedirectPage = () => {
  const navigate = useNavigate()
  const { signInWithMicrosoft } = useAuth()
  const { instance, accounts } = useMsal()

  const login = useCallback(async () => {
    try {
      if (!accounts || accounts.length === 0) {
        console.error('No accounts found in MSAL instance.')
        return
      }
      const account = accounts[0]
      const authResult = await instance.acquireTokenSilent({
        scopes: ['User.Read'],
        account: account,
      })
      const token = authResult.accessToken
      await signInWithMicrosoft(token)
      navigate('/')
    } catch (error) {
      console.error('Error during Microsoft login:', error)
    }
  }, [navigate, signInWithMicrosoft, accounts, instance])

  useEffect(() => {
    login()
  }, [login])

  return <CircularProgress />
}
