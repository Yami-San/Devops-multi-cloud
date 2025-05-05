# Etapa base
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# Etapa de construcción
FROM base AS builder
COPY . .
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
