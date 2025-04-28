#!/bin/sh
# ── start.sh ──

# 1) Arranca el worker en segundo plano (ajusta si usas ts-node o ya compilaste)
npx ts-node src/app/workers/worker.ts &

# 2) Inicia Next.js App Router en modo producción
npm run start
