import { useEffect } from 'react'

// This page is loaded inside the Facebook OAuth popup.
// It reads the code/state from the URL and posts them to the opener, then closes.
export const FacebookCallbackPage = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    window.opener?.postMessage(
      {
        type: 'facebook-oauth-callback',
        code: params.get('code') ?? undefined,
        state: params.get('state') ?? undefined,
        error: params.get('error') ?? undefined,
      },
      window.location.origin
    )

    window.close()
  }, [])

  return null
}
