FROM node:20

# 1. Define el directorio de trabajo
WORKDIR /app

# 2. Copia ficheros de dependencias e instala
COPY package*.json ./
RUN npm install

# 3. Copia el esquema de Prisma *antes* de generar el cliente
COPY prisma ./prisma
# Genera el cliente de Prisma
RUN npx prisma generate

# 4. Copia el resto del código
COPY . .

# 5. Expone el puerto de Next.js
EXPOSE 3000

# 6. Lanza ambos procesos
CMD ["sh", "-c", "npm run start & node services/worker.js"]
