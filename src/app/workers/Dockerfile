FROM node:22.14.0-alpine
WORKDIR /app

# 1) Copiar manifestos
COPY package.json yarn.lock ./

# 2) Instalar con Yarn
RUN yarn install --production   # instala sólo deps de producción :contentReference[oaicite:2]{index=2}

# 3) Copiar el código del worker
COPY src/app/workers ./src/app/workers

# 4) Ejecutar el worker
CMD ["node", "src/app/workers/worker.js"]
