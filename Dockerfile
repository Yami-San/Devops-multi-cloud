# 1) Etapa de build --------------------------------------------------------
    FROM node:22.14.0-alpine AS builder

    WORKDIR /app
    
    # Copiamos solo package.json y prisma/schema para cachear npm install y prisma generate
    COPY package.json package-lock.json ./
    COPY prisma ./prisma/
    
    # Instalamos dependencias y generamos el cliente Prisma
    RUN npm ci \
        && npx prisma generate
    
    # Copiamos el resto del código y construimos Next.js
    COPY . .
    RUN npm run build
    
    # 2) Etapa de producción --------------------------------------------------
    FROM node:22.14.0-alpine
    
    WORKDIR /app
    
    # Traemos del builder solo lo necesario
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/package.json ./package.json
    COPY --from=builder /app/prisma ./prisma
    
    # Variables de entorno (o monta tu .env en docker run / docker-compose)
    # ENV DATABASE_URL="tu_url_supabase"\
    #     NEXT_PUBLIC_SUPABASE_URL="..."\
    #     NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
    
    EXPOSE 3000
    
    # Espera a que la base de datos esté lista (opcional pero muy recomendable)
    # Incluye en tu proyecto un script wait-for-it.sh o usa dockerize
    # COPY wait-for-it.sh /usr/local/bin/
    # RUN chmod +x /usr/local/bin/wait-for-it.sh
    
    # 3) CMD usando concurrently para no morir si uno de los procesos falla ----
    RUN npm install --save-dev concurrently
    CMD ["npx", "concurrently", \
          "\"npm run start\"", \
          "\"node src/app/workers/worker.js\""]
    