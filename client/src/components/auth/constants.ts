const origin = window.location.origin
export const FACEBOOK_REDIRECT_URI = `${origin}/auth/facebook/callback`
export const MICROSOFT_REDIRECT_URI = `${origin}/auth/microsoft/callback`

console.log(`FACEBOOK_REDIRECT_URI: ${FACEBOOK_REDIRECT_URI}`)
console.log(`MICROSOFT_REDIRECT_URI: ${MICROSOFT_REDIRECT_URI}`)
