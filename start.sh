#!/bin/sh
# ── start.sh ──

# 1) Arranca el worker en segundo plano (ajusta si usas ts-node o ya compilaste)
#!/bin/sh
# Ejecuta Next.js en segundo plano
npm start &

# Ejecuta el worker en primer plano
node ./src/app/workers/worker.js
