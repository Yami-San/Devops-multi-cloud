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

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copia artefactos de Next.js y node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# (Opcional) Worker y start.sh si los usas...
# COPY --from=builder /app/src/app/workers ./src/app/workers
# COPY start.sh ./
# RUN chmod +x start.sh

EXPOSE 3000
CMD ["npm", "start"]
