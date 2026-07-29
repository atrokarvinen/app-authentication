import { Router } from 'express'
import { prisma } from '../lib/prisma'

export const healthRouter = Router()

healthRouter.get('/', async (_request, response) => {
  let database = 'ok'

  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    database = 'error'
  }

  response.json({
    status: 'ok',
    service: 'server',
    database,
    timestamp: new Date().toISOString(),
  })
})
