FROM node:22.14.0-alpine

WORKDIR /app

# Copy everything and install deps (including dev‐deps)
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

# Copy your TS code
COPY src/app/workers ./src/app/workers

# Install ts-node if you didn’t already include it
RUN npm install --save-dev ts-node typescript @types/node

# Tell Node to register ts-node for .ts imports
CMD ["node", "-r", "ts-node/register", "src/app/workers/worker.ts"]
