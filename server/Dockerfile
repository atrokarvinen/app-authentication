FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci && DATABASE_URL=postgresql://x:x@localhost/x npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# Full install keeps prisma CLI available for migrate deploy at startup
RUN npm ci && DATABASE_URL=postgresql://x:x@localhost/x npx prisma generate
COPY --from=build /app/dist ./dist
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
