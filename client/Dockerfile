FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build-time env vars baked into the static bundle
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_FACEBOOK_APP_ID
ARG VITE_FACEBOOK_REDIRECT_URI
ARG VITE_MICROSOFT_CLIENT_ID
ARG VITE_MICROSOFT_REDIRECT_URI
ARG VITE_MICROSOFT_AUTHORITY

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
