export const env = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  logLevel: process.env.LOG_LEVEL || 'info',
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://app_user:app_password@localhost:5432/app_authentication?schema=public',
}
