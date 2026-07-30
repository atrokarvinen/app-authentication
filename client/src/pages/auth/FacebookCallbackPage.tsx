import { useCallback, useEffect } from 'react'
import { loginWithFacebook } from '../../api/auth'

// This page is loaded inside the Facebook OAuth popup.
// It reads the code/state from the URL and posts them to the opener, then closes.
export const FacebookCallbackPage = () => {
  const login = useCallback(async (code: string, state: string | null) => {
    try {
      const redirectUri = `${window.location.origin}/auth/facebook/callback`
      const authResponse = await loginWithFacebook({ code, redirectUri })

      window.localStorage.setItem(
        'app_auth_session_token',
        authResponse.sessionToken
      )
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
