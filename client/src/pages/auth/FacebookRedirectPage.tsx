import { CircularProgress } from '@mui/material'
import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'

export const FacebookRedirectPage = () => {
  const navigate = useNavigate()
  const { signInWithFacebook } = useAuth()

  const login = useCallback(
    async (code: string) => {
      try {
        await signInWithFacebook(code)
        navigate('/')
      } catch (error) {
        console.error('Error during Facebook login:', error)
      }
    },
    [navigate, signInWithFacebook]
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    login(code ?? '')
  }, [login])

  return <CircularProgress />
}
