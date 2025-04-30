FROM node:22.14.0-alpine

WORKDIR /app

# 1) Copia definiciones de dependencias
COPY package*.json ./

# 2) Instala dependencias, incluyendo ts-node para ejecutar TS en caliente
RUN npm install \
 && npm install ts-node typescript --save

# 3) Copia todo tu código fuente (incluye src/app/workers/worker.ts y el App Router)
COPY . .

# 4) Expone el puerto donde Next.js atenderá (por defecto 3000)
EXPOSE 3000

# 5) Arranca Next.js App Router y el worker simultáneamente:
#    - `npm run start` invoca `next start` (tu App Router) en background
#    - `npx ts-node src/app/workers/worker.ts` ejecuta tu worker TS en foreground
CMD ["sh", "-c", "npm run start & npx ts-node src/app/workers/worker.ts"]
