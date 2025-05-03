# Usa una imagen ligera de Node.js
FROM node:22.14.0-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia package.json y lockfile, luego instala dependencias
COPY package*.json ./
RUN npm ci

# Copia solo el código del worker
COPY src/app/workers ./src/app/workers

# (Opcional) Si usas TypeScript
RUN npm install --save-dev ts-node typescript @types/node

# Define variable NODE_ENV por defecto
ENV NODE_ENV=production

# Comando que arranca el worker
# Ajusta la ruta si tu archivo es .js en lugar de .ts
CMD ["npx", "ts-node", "src/app/workers/worker.ts"]
