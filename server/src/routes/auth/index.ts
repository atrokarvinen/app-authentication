import { Router } from 'express'
import { env } from '../../config/env'
import { getLogger } from '../../lib/logging/httpLogger'
import { getSessionTokenFromRequest } from './services/authShared'
import { getCurrentUser } from './services/currentUser/currentUserService'
import type { CurrentUserResponseBody } from './services/currentUser/types'
import { deleteUser } from './services/delete/deleteService'
import { AuthServiceError } from './services/errors'
import { loginUser } from './services/login/loginService'
import { logoutUser } from './services/logout/logoutService'
import type { LogoutResponseBody } from './services/logout/types'
import { registerUser } from './services/register/registerService'
import type { ErrorResponse } from './types/http'

const authRouter = Router()

authRouter.post('/register', async (request, response) => {
  const log = getLogger(request)

  try {
    const { result, logMeta } = await registerUser({
      body: request.body,
      ipAddress: request.ip || null,
      userAgent: request.get('user-agent') || null,
    })

    response.status(201).json(result)
    log.info(logMeta, 'auth.register.success')
  } catch (error) {
    if (error instanceof AuthServiceError) {
      log.warn(error.logMeta, error.logEvent)
      response
        .status(error.statusCode)
        .json({ error: error.message } as ErrorResponse)
      return
    }

    throw error
  }
})

authRouter.post('/login', async (request, response) => {
  const log = getLogger(request)

  try {
    const { result, logMeta } = await loginUser({
      body: request.body,
      ipAddress: request.ip || null,
      userAgent: request.get('user-agent') || null,
    })

    response.json(result)
    log.info(logMeta, 'auth.login.success')
  } catch (error) {
    if (error instanceof AuthServiceError) {
      log.warn(error.logMeta, error.logEvent)
      response
        .status(error.statusCode)
        .json({ error: error.message } as ErrorResponse)
      return
    }

    throw error
  }
})

authRouter.post('/logout', async (request, response) => {
  const log = getLogger(request)
  const sessionToken = getSessionTokenFromRequest(request)

  try {
    const { revokedCount } = await logoutUser({ sessionToken })

    response.json({ success: true } as LogoutResponseBody)
    log.info({ revokedCount }, 'auth.logout.success')
  } catch (error) {
    if (error instanceof AuthServiceError) {
      log.warn(error.logMeta, error.logEvent)
      response
        .status(error.statusCode)
        .json({ error: error.message } as ErrorResponse)
      return
    }

    throw error
  }
})

authRouter.get('/me', async (request, response) => {
  const log = getLogger(request)
  const sessionToken = getSessionTokenFromRequest(request)

  try {
    const { result, logMeta } = await getCurrentUser({ sessionToken })

    response.json(result as CurrentUserResponseBody)
    log.info(logMeta, 'auth.me.success')
  } catch (error) {
    if (error instanceof AuthServiceError) {
      log.warn(error.logMeta, error.logEvent)
      response
        .status(error.statusCode)
        .json({ error: error.message } as ErrorResponse)
      return
    }

    throw error
  }
})

if (env.nodeEnv === 'development') {
  authRouter.delete('/dev/users', async (request, response) => {
    const log = getLogger(request)
    const email = request.query.email as string | undefined

    log.info("deleteUser route called with email: '%s'", email)

    if (!email) {
      response
        .status(400)
        .json({ error: 'email query parameter is required.' } as ErrorResponse)
      return
    }

    try {
      const { logMeta, deleted } = await deleteUser({ email })

      response.json({ deleted })
      log.info(logMeta, 'auth.dev.delete_user.success')
    } catch (error) {
      if (error instanceof AuthServiceError) {
        log.warn(error.logMeta, error.logEvent)
        response
          .status(error.statusCode)
          .json({ error: error.message } as ErrorResponse)
        return
      }

      throw error
    }
  })
}

export { authRouter }
