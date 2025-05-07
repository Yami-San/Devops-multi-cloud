// worker.js

require('dotenv').config();  
const { ServiceBusClient } = require('@azure/service-bus');  
const axios = require('axios');

// Configuración vía .env
const CONNECTION_STR     = process.env.CONNECTION_STR;        
const TOPIC_NAME         = process.env.TOPIC_NAME;            
const SUBSCRIPTION_NAME  = process.env.SUBSCRIPTION_NAME;     
const POST_URL           = process.env.POST_URL;              

// Parámetros para publicar
const SOURCE   = 'coordinator';  
const DEST     = 'queue-ms';     

// Base URL para consumir tu API Next.js
const API_BASE = process.env.API_BASE_URL || 'http://nextjs:3000';  

/**
 * Obtiene entidades desde tus endpoints HTTP.
 */
async function fetchEntitiesViaHTTP() {
  const [pilotosRes, avionesRes, segurosRes] = await Promise.all([
    axios.get(`${API_BASE}/api/v2/pilotos`),   // GET /api/v2/pilotos
    axios.get(`${API_BASE}/api/v2/aviones`),   // GET /api/v2/aviones
    axios.get(`${API_BASE}/api/v2/seguros`)    // GET /api/v2/seguros
  ]);
  return {
    pilotos: pilotosRes.data,
    aviones: avionesRes.data,
    seguros: segurosRes.data
  };
}

/**
 * Envía el mensaje enriquecido a tu cola externa.
 */
async function postToExternalQueue(enrichedMessage) {
  const body = { message: JSON.stringify(enrichedMessage) };
  const res  = await axios.post(POST_URL, body, {
    headers: {
      'Content-Type':    'application/json',
      'X-Source':        SOURCE,
      'X-Destination':   DEST
    }
  });
  return res.status;
}

/**
 * Lógica principal: suscribirse y procesar mensajes entrantes.
 */
async function start() {
  console.log(`Conectando a Azure Service Bus…`);  
  const sbClient = new ServiceBusClient(CONNECTION_STR);                         // iniciar cliente :contentReference[oaicite:4]{index=4}
  const receiver = sbClient.createReceiver(TOPIC_NAME, SUBSCRIPTION_NAME);        // crear suscripción :contentReference[oaicite:5]{index=5}

  console.log(`Suscrito a topic '${TOPIC_NAME}', subscription '${SUBSCRIPTION_NAME}'.`);  

  receiver.subscribe({  
    async processMessage(message) {
      console.log('Mensaje recibido:', message.body);  

      try {
        // Enriquecer con datos de tus APIs Next.js
        const entities = await fetchEntitiesViaHTTP();  

        // Construir mensaje enriquecido
        const enriched = {
          ...message.body,
          data: {
            ...message.body.data,
            entities
          }
        };

        // Publicar en tu endpoint externo
        const status = await postToExternalQueue(enriched);  
        console.log('Mensaje reenviado con éxito, status:', status);  
      } catch (err) {
        console.error('Error procesando mensaje:', err.message);  
      }
    },

    async processError(err) {
      console.error('Error en el receiver:', err);  
    }
  });

  // No cerramos el cliente ni el proceso; receiver.subscribe mantiene el loop vivo :contentReference[oaicite:6]{index=6}.
}

// Ejecutar el worker
start().catch(err => {
  console.error('Error inicializando el worker:', err);
  process.exit(1);
});
