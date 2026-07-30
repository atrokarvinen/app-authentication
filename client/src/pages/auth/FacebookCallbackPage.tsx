import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'

// This page is loaded inside the Facebook OAuth popup.
// It reads the code/state from the URL and posts them to the opener, then closes.
export const FacebookCallbackPage = () => {
  const navigate = useNavigate()
  const { signInWithFacebook } = useAuth()

  const login = useCallback(async (code: string, state: string | null) => {
    try {
      await signInWithFacebook(code)
      navigate('/')
    } catch (error) {
      console.error('Error during Facebook login:', error)
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const code = params.get('code')
    const state = params.get('state')
    const error = params.get('error')

    console.log(
      `Facebook OAuth callback received. code=${code}, state=${state}, error=${error}`
    )

    login(code ?? '', state).finally(() => {
      window.close()
    })
  }, [login])

  return <div>Test</div>
}
