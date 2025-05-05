// worker.js

require('dotenv').config();
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Cargamos de .env
const POST_URL = process.env.POST_URL;       // <-- URL de tu cola (e.g. https://.../api/v2/messages/publish)
const SOURCE  = 'coordinato';
const DEST    = 'queue-ms';

async function fetchEntities() {
  // Traemos cada entidad completa
  const aviones  = await prisma.avion.findMany();
  const pilotos  = await prisma.piloto.findMany();
  const seguros  = await prisma.seguro.findMany();

  return { aviones, pilotos, seguros };
}

async function publishMessage(rawMessage) {
  // Recuperamos entidades
  const entities = await fetchEntities();

  // Añadimos las entidades al mensaje
  const enriched = {
    ...rawMessage,
    data: {
      ...rawMessage.data,
      entities
    }
  };

  // El body que manda el worker
  const body = { message: JSON.stringify(enriched) };

  // Hacemos el POST
  const res = await axios.post(POST_URL, body, {
    headers: {
      'Content-Type': 'application/json',
      'X-Source': SOURCE,
      'X-Destination': DEST
    }
  });

  return res.status;
}

async function start() {
  console.log('Worker arrancado. Preparado para publicar.');

  // Ejemplo: este objeto vendría de tu recepción de mensaje original
  const incoming = {
    type: 'event',
    sendTo: 'microservice2',
    failOn: 'queue-reprocessed',
    error: '',
    // opcionalmente ya puedes tener un data previo
    data: {}
  };

  try {
    const status = await publishMessage(incoming);
    console.log('Publicado con éxito, status:', status);
  } catch (err) {
    console.error('Error publicando mensaje:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Si ejecutas worker.js directamente
if (require.main === module) start();
