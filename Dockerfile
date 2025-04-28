# —————— Etapa 1: builder ——————
FROM node:22.14.0-alpine AS builder
WORKDIR /app

# Copia las definiciones de dependencias e instala en modo CI
COPY package*.json package-lock.json ./
RUN npm install

# Copia el resto del código y genera el build de Next.js\ COPY . .
RUN npm run build

# —————— Etapa 2: runner ——————
FROM node:22.14.0-alpine AS runner
WORKDIR /app

# Variables para producción
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copia artefactos necesarios del builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist/workers ./dist/workers

# Copiamos script de inicio
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Expone el puerto en el que correrá Next.js
EXPOSE 3000

# Arranca ambos procesos con tiny init
# instalamos tini para manejo de señales
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--", "./start.sh"]