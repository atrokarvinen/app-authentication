import cors from 'cors'
import express from 'express'
import { env } from './config/env'
import { authRouter } from './routes/auth'
import { healthRouter } from './routes/health'

export const app = express()

app.use(
  cors({
    origin: env.clientOrigin,
  })
)
app.use(express.json())

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
