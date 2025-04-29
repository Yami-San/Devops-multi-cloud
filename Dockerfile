# —————— Etapa 1: builder ——————
FROM node:22.14.0-alpine AS builder
WORKDIR /app

# 1) Copia package.json / lock y prisma schema
COPY package*.json ./
COPY prisma ./prisma

# 2) Instala dependencias y genera Prisma Client
RUN npm install
RUN npx prisma generate

# 3) Copia el resto del código y construye Next.js
COPY . .
RUN npm run build

# —————— Etapa 2: runner ——————
FROM node:22.14.0-alpine AS runner
WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copia artefactos de Next.js
COPY --from=builder /app/.next       ./.next
COPY --from=builder /app/public      ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copia tu carpeta de worker TypeScript
# (src/ está en la raíz, así que el path relativo dentro de /app es src/app/workers)
COPY --from=builder /app/src/app/workers ./src/app/workers

# Copia y da permisos al script de arranque
COPY start.sh ./
RUN chmod +x start.sh

# Instala tini para manejo de procesos y señales
RUN apk add --no-cache tini

EXPOSE 3000

# ENTRYPOINT que arranca Next.js y el worker
ENTRYPOINT ["/sbin/tini", "--", "./start.sh"]

