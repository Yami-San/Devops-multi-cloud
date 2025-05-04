# 1) Build stage
FROM node:22.14.0-alpine AS builder

WORKDIR /app

# Copy package files and install deps
COPY package.json package-lock.json ./
RUN npm ci

# Copy your TS source and compile it
COPY src/app/workers ./src/app/workers
COPY tsconfig.json ./
RUN npx tsc --outDir dist/workers

# 2) Production stage
FROM node:22.14.0-alpine

WORKDIR /app

# Only copy production deps and compiled code
COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist/workers ./workers

# Use the compiled JS
CMD ["node", "workers/worker.js"]
