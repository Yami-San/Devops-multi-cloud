// worker.js

require('dotenv').config();
const { ServiceBusClient } = require('@azure/service-bus');
const axios = require('axios');

// Configuración vía .env
const CONNECTION_STR     = process.env.CONNECTION_STR;       // Cadena de conexión a Azure Service Bus
const TOPIC_NAME         = process.env.TOPIC_NAME;           // Nombre del topic en Service Bus
const SUBSCRIPTION_NAME  = process.env.SUBSCRIPTION_NAME;    // Nombre de la suscripción
const POST_URL           = process.env.POST_URL;             // Endpoint externo para reenviar mensajes

// Parámetros para publicar
const SOURCE   = 'microservice2';
const DEST     = 'queue-ms';

// Base URL para consumir tu API Next.js
const API_BASE = process.env.API_BASE_URL || 'http://127.0.0.1:3000';

/**
 * Obtiene entidades desde tus endpoints HTTP.
 */
async function fetchEntitiesViaHTTP() {
  const [pilotosRes, avionesRes, segurosRes] = await Promise.all([
    axios.get(`${API_BASE}/api/v2/pilotos`),
    axios.get(`${API_BASE}/api/v2/aviones`),
    axios.get(`${API_BASE}/api/v2/seguros`)
  ].map(p => p.then(res => res.data)));
  return {
    pilotos: pilotosRes.data,
    aviones: avionesRes.data,
    seguros: segurosRes.data
  };
}

/**
 * Publica el mensaje enriquecido en tu endpoint externo.
 */
async function postToExternalQueue(enrichedMessage) {
  const body = { message: JSON.stringify(enrichedMessage) };
  const res  = await axios.post(POST_URL, body, {
    headers: {
      'Content-Type':  'application/json',
      'X-Source':      SOURCE,
      'X-Destination': DEST
    }
  });
  return res.status;
}

/**
 * Lógica principal: suscribirse y procesar mensajes entrantes.
 */
async function start() {
  console.log(`Conectando a Azure Service Bus…`);
  const sbClient = new ServiceBusClient(CONNECTION_STR);
  const receiver = sbClient.createReceiver(TOPIC_NAME, SUBSCRIPTION_NAME);

  console.log(`Suscrito a topic '${TOPIC_NAME}', subscription '${SUBSCRIPTION_NAME}'.`);

  receiver.subscribe({
    async processMessage(message) {
      console.log('Mensaje recibido:', message.body);

      try {
        // 1. Obtener entidades desde tu API Next.js
        console.log('Empezando fetch de entidades')
        const entities = await fetchEntitiesViaHTTP();
        console.log('contrucción del payload')
        // 2. Construir payload base con campos obligatorios
        const enriched = {
          type:   message.body.type,                              // Tipo de mensaje
          sendTo: "microservice3",            // Destino de envío
          failOn: message.body.failOn,                // Condición de fallo
          error:  message.body.error,                 // Mensaje de error si aplica
          data:   { entities }                              // Datos enriquecidos
        };
        console.log('payload completado')
        console.log('Pre publicacion en la cola')
        // 3. Publicar en el endpoint externo
        const status = await postToExternalQueue(enriched);
        console.log('Publicado con éxito, status:');
      } catch (err) {
        console.error('Error procesando mensaje:', err.message);
      }
    },

    async processError(err) {
      console.error('Error en el receiver:', err);
    }
  });

  // El proceso permanece activo: receiver.subscribe mantiene el loop vivo.
}

// Ejecutar el worker
start().catch(err => {
  console.error('Error inicializando el worker:', err);
  process.exit(1);
});
