import cors from 'cors'
import express from 'express'
import { env } from './config/env'
import { httpLogger } from './lib/logging/httpLogger'
import { authRouter } from './routes/auth/index'
import { healthRouter } from './routes/health'

export const app = express()
app.disable('x-powered-by')

app.use(cors({ origin: env.clientOrigin }))
app.use(httpLogger)
app.use(express.json())

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
