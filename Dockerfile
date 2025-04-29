# —————— Etapa 1: builder ——————
FROM node:22.14.0-alpine AS builder
WORKDIR /app

# 1) Copia package.json, lock y Prisma schema
COPY package*.json ./
COPY prisma ./prisma

# 2) Instala dependencias y genera Prisma Client
RUN npm install
RUN npx prisma generate

# 3) Copia todo el código y construye Next.js
COPY . .
RUN npm run build

# —————— Etapa 2: runner ——————
FROM node:22.14.0-alpine AS runner
WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Instala tini y ts-node para manejar procesos y ejecutar TS
RUN apk add --no-cache tini
RUN npm install ts-node typescript --production=false

# Copia los artefactos de Next.js y node_modules
COPY --from=builder /app/.next       ./.next
COPY --from=builder /app/public      ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copia TODO el código fuente (incluye src/app/workers)
COPY --from=builder /app/src ./src

# Copia y da permisos al script de arranque
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Exponer puerto y usar tini como init
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--", "./start.sh"]
