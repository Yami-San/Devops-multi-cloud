#!/bin/sh
# start.sh

# 1) Lanza el worker TS en background
npx ts-node src/app/workers/worker.ts &

# 2) Luego arranca Next.js en primer plano
npm start

