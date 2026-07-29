import pino from 'pino'
import { env } from '../../config/env'

const isDevelopment = process.env.NODE_ENV !== 'production'

const baseLoggerOptions = {
  level: env.logLevel,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.body.password',
      'req.body.confirmPassword',
      'sessionToken',
      'refreshToken',
      'oauthAccessToken',
      'oauthRefreshToken',
    ],
    censor: '[REDACTED]',
  },
}

export const logger = pino(
  isDevelopment
    ? {
        ...baseLoggerOptions,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
    : baseLoggerOptions
)