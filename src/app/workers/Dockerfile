FROM node:22.14.0-alpine

WORKDIR /app

# 1) Copiamos manifestos de dependencias
COPY package.json package-lock.json ./

# 2) Instalamos
RUN npm ci --only=production

# 3) Copiamos el código del worker
COPY src/app/workers ./src/app/workers

# 4) Arrancamos el worker
CMD ["node", "src/app/workers/worker.js"]
