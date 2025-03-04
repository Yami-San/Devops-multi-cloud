# Usa una imagen base de Node.js (puedes ajustar la versión)
FROM node:16-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias y luego instala
COPY package*.json ./
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Genera el build de la aplicación
RUN npm run build

# Expone el puerto en el que se ejecutará la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
