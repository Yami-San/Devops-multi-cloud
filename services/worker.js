// worker.js

require('dotenv').config();
const axios = require('axios');

// URL base de tu API Next.js (puede ser localhost en desarrollo o tu dominio en producción)
const API_BASE = 'http://localhost:3000';

const POST_URL = process.env.POST_URL;       // <-- endpoint de la cola
const SOURCE   = 'coordinato';
const DEST     = 'queue-ms';

// Función para obtener datos de tus endpoints HTTP
async function fetchEntitiesViaHTTP() {
  const [pilotosRes, avionesRes, segurosRes] = await Promise.all([
    axios.get(`${API_BASE}/api/v2/pilotos`),
    axios.get(`${API_BASE}/api/v2/aviones`),
    axios.get(`${API_BASE}/api/v2/seguros`)
  ]);
  return {
    pilotos: pilotosRes.data,
    aviones: avionesRes.data,
    seguros: segurosRes.data
  };
}

async function publishMessage(rawMessage) {
  // Recupera entidades via HTTP
  const entities = await fetchEntitiesViaHTTP();

  // Enriquecer el mensaje
  const enriched = {
    ...rawMessage,
    data: {
      ...rawMessage.data,
      entities
    }
  };

  // Construir body y enviarlo a la cola
  const body = { message: JSON.stringify(enriched) };
  const res  = await axios.post(POST_URL, body, {
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

  // Ejemplo de mensaje entrante
  const incoming = {
    type: 'event',
    sendTo: 'microservice2',
    failOn: 'queue-reprocessed',
    error: '',
    data: {}
  };

  try {
    const status = await publishMessage(incoming);
    console.log('Publicado con éxito, status:', status);
  } catch (err) {
    console.error('Error publicando mensaje:', err.message);
  }
}

// Ejecutar si se corre directamente
if (require.main === module) start();
