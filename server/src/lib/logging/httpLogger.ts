import type { Logger } from 'pino'
import pinoHttp from 'pino-http'
import { logger } from './logger'

export const httpLogger = pinoHttp({
  logger,
  autoLogging: true,
  customLogLevel(_request, response, error) {
    if (error || response.statusCode >= 500) {
      return 'error'
    }

    if (response.statusCode >= 400) {
      return 'warn'
    }

    return 'info'
  },
})

export const getLogger = (request: { log?: Logger }): Logger => {
  return request.log ?? logger
}
