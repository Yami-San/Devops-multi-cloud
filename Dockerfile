# 1) Etapa de build --------------------------------------------------------
    FROM node:22.14.0-alpine AS builder

    WORKDIR /app
    
    # 1.1 Copiamos package.json, lockfile y prisma/schema.prisma para cachear
    COPY package.json package-lock.json ./
    COPY prisma ./prisma/
    
    # 1.2 Instalamos dependencias y generamos Prisma Client
    RUN npm ci \
        && npx prisma generate
    
    # 1.3 Copiamos el resto del código y construimos Next.js
    COPY . .
    RUN npm run build
    
    # 2) Etapa de producción --------------------------------------------------
    FROM node:22.14.0-alpine
    
    WORKDIR /app
    
    # 2.1 Copiamos TODO lo que se generó en `builder` (incluye src/app/workers)
    COPY --from=builder /app ./
    
    # 2.2 Exponemos el puerto de Next.js
    EXPOSE 3000
    
    # 2.3 Instalamos `concurrently` para lanzar ambos procesos
    RUN npm install --save-dev concurrently
    
    # 3) Arranque --------------------------------------------------------------
    #    - Levanta Next.js (App Router)  
    #    - Arranca tu worker
    CMD ["npx", "concurrently", \
          "\"npm run start\"", \
          "\"node services/worker.js\""]
    