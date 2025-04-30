#!/bin/sh
# start.sh

# Lanza el worker TS en background usando el loader ESM de ts-node
node --loader ts-node/esm src/app/workers/worker.ts &

# Luego arranca Next.js en primer plano
npm start


