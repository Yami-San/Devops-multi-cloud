FROM node:20

# 1. Define el directorio de trabajo
WORKDIR /app

# 2. Copia ficheros de dependencias e instala
COPY package*.json ./
RUN npm install

# 3. Copia el resto del código
COPY . .

# 4. Expone el puerto de Next.js
EXPOSE 3000

# 5. Lanza ambos procesos con sh -c
CMD ["sh", "-c", "npm run start & node services/worker.js"]
