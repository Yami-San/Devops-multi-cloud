FROM node:22.14.0-alpine

WORKDIR /app

# Instalación de dependencias
COPY package*.json ./
RUN npm install

# Copia el código completo
COPY . .

# Construye Next.js
RUN npm run build    # genera .next

EXPOSE 3000

# CMD que inicia Next.js y el worker JS
CMD ["sh", "-c", "npm run start & node src/app/workers/worker.js"]
