# Usa una imagen base de Node.js (puedes ajustar la versión si es necesario)
FROM node:16-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de configuración de dependencias (si tienes bun.lockb, inclúyelo)
COPY package.json bun.lockb* ./

# Instala las dependencias usando Bun
RUN bun install

# Copia el resto del código de la aplicación
COPY . .

# Construye la aplicación (ajusta el comando según lo definido en tu package.json)
RUN bun run build

# Expone el puerto en el que se ejecuta la aplicación (por defecto Next.js usa 3000)
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["bun", "run", "start"]
