import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'

// This page is loaded inside the Microsoft OAuth popup.
// It reads the code/state from the URL and posts them to the opener, then closes.
export const MicrosoftCallbackPage = () => {
  const navigate = useNavigate()
  const { signInWithMicrosoft } = useAuth()

  const login = useCallback(
    async (code: string) => {
      try {
        await signInWithMicrosoft(code)
        navigate('/')
      } catch (error) {
        console.error('Error during Microsoft login:', error)
      }
    },
    [navigate, signInWithMicrosoft]
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const code = params.get('code')
    const state = params.get('state')
    const error = params.get('error')

    console.log(
      `Microsoft OAuth callback received. code=${code}, state=${state}, error=${error}`
    )

    login(code ?? '').finally(() => {
      window.close()
    })
  }, [login])

  return <div>Test</div>
}
