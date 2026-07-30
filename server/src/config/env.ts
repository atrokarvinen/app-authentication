import { config as loadDotEnv } from 'dotenv'
import path from 'node:path'

// Load server/.env for both src (tsx watch) and dist (compiled) runtime.
loadDotEnv({
  path: path.resolve(__dirname, '../../.env'),
})

export const env = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  logLevel: process.env.LOG_LEVEL || 'info',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  databaseUrl: process.env.DATABASE_URL || '',
}
