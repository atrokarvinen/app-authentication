/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'

const GOOGLE_SCRIPT_ID = 'google-identity-services-client'
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

type UseGoogleIdentityScriptArgs = {
  enabled: boolean
  onScriptError?: (error: string | null) => void
}

type UseGoogleIdentityScriptResult = {
  isLoadingScript: boolean
  isScriptReady: boolean
  scriptError: string | null
}

export function useGoogleIdentityScript({
  enabled,
  onScriptError,
}: UseGoogleIdentityScriptArgs): UseGoogleIdentityScriptResult {
  const [isLoadingScript, setIsLoadingScript] = useState(false)
  const [isScriptReady, setIsScriptReady] = useState(false)
  const [scriptError, setScriptError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setIsLoadingScript(false)
      setIsScriptReady(false)
      setScriptError(null)
      onScriptError?.(null)
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    if (window.google) {
      setIsLoadingScript(false)
      setIsScriptReady(true)
      setScriptError(null)
      onScriptError?.(null)
      return
    }

    let isCancelled = false

    const handleLoad = () => {
      if (isCancelled) {
        return
      }

      setIsLoadingScript(false)

      if (!window.google) {
        setIsScriptReady(false)
        setScriptError('Google sign-in failed to initialize.')
        onScriptError?.('Google sign-in failed to initialize.')
        return
      }

      setIsScriptReady(true)
      setScriptError(null)
      onScriptError?.(null)
    }

    const handleError = () => {
      if (isCancelled) {
        return
      }

      setIsLoadingScript(false)
      setIsScriptReady(false)
      setScriptError('Failed to load Google sign-in.')
      onScriptError?.('Failed to load Google sign-in.')
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID)

    if (existingScript) {
      setIsLoadingScript(true)
      existingScript.addEventListener('load', handleLoad)
      existingScript.addEventListener('error', handleError)

      return () => {
        isCancelled = true
        existingScript.removeEventListener('load', handleLoad)
        existingScript.removeEventListener('error', handleError)
      }
    }

    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = GOOGLE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.addEventListener('load', handleLoad)
    script.addEventListener('error', handleError)

    setIsLoadingScript(true)
    document.head.append(script)

    return () => {
      isCancelled = true
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)
    }
  }, [enabled, onScriptError])

  return {
    isLoadingScript,
    isScriptReady,
    scriptError,
  }
}
