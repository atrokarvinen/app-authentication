import type { Logger } from 'pino'
import pinoHttp from 'pino-http'
import { logger } from './logger'

export const httpLogger = pinoHttp({
  logger,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
})

export const getLogger = (request: { log?: Logger }): Logger => {
  return request.log ?? logger
}
