# —————— Etapa 1: builder ——————
FROM node:22.14.0-alpine AS builder
WORKDIR /app

# 1) Copia los archivos de dependencias y el esquema de Prisma
COPY package*.json ./
COPY prisma ./prisma

# 2) Instala las dependencias y genera el cliente de Prisma
RUN npm install
RUN npx prisma generate

# 3) Copia el resto del código y construye la aplicación Next.js
COPY . .
RUN npm run build

# —————— Etapa 2: runner ——————
FROM node:22.14.0-alpine AS runner
WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Instala tini para el manejo adecuado de señales
RUN apk add --no-cache tini

# Copia los artefactos necesarios desde la etapa de construcción
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copia el script de inicio y otorga permisos de ejecución
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Define tini como el punto de entrada para manejar correctamente las señales
ENTRYPOINT ["/sbin/tini", "--"]

# Comando por defecto para iniciar la aplicación
CMD ["./start.sh"]

EXPOSE 3000
