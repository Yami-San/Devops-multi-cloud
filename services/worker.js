// worker.js

require('dotenv').config();
const { ServiceBusClient } = require('@azure/service-bus');
const axios = require('axios');

// Configuración vía .env
const CONNECTION_STR     = process.env.CONNECTION_STR;         // Azure Service Bus principal
const ALT_CONNECTION_STR = process.env.ALT_CONNECTION_STR;     // Azure Service Bus alternativo
const TOPIC_NAME         = process.env.TOPIC_NAME;
const SUBSCRIPTION_NAME  = process.env.SUBSCRIPTION_NAME;
const POST_URL           = process.env.POST_URL;               // HTTP principal
const ALT_POST_URL       = process.env.ALT_POST_URL;           // HTTP alternativo

const SOURCE = 'microservice2';
const DEST   = 'queue-ms';

// Dentro de un solo contenedor, localhost apunta a Next.js
const API_BASE = process.env.API_BASE_URL || 'http://127.0.0.1:3000';

async function fetchEntitiesViaHTTP() {
  const [p, a, s] = await Promise.all([
    axios.get(`${API_BASE}/api/v2/pilotos`),
    axios.get(`${API_BASE}/api/v2/aviones`),
    axios.get(`${API_BASE}/api/v2/seguros`)
  ]);
  return { pilotos: p.data, aviones: a.data, seguros: s.data };
}

// Solo se encarga de POST HTTP
async function postToExternalQueue(url, enriched) {
  const body = { message: JSON.stringify(enriched) };
  const res  = await axios.post(url, body, {
    headers: {
      'Content-Type':    'application/json',
      'X-Source':        SOURCE,
      'X-Destination':   DEST
    }
  });
  return res.status;
}

async function start() {
  console.log('Conectando a Azure Service Bus…');
  
  // Elige la cadena de conexión según el mensaje
  const sbClient = new ServiceBusClient(CONNECTION_STR);
  const receiver = sbClient.createReceiver(TOPIC_NAME, SUBSCRIPTION_NAME);

  console.log(`Suscrito a ${TOPIC_NAME}/${SUBSCRIPTION_NAME}`);

  receiver.subscribe({
    async processMessage(msg) {
      const body = msg.body;
      console.log('Mensaje recibido:', body);

      try {
        console.log('Fetch de entidades…');
        const entities = await fetchEntitiesViaHTTP();

        const enriched = {
          type:   body.type,
          sendTo: 'microservice3',
          failOn: body.failOn,
          error:  body.error,
          data:   { entities }
        };
        console.log('Payload listo');

        // Si failOn es 'microservice2', usamos variables alternativas:
        const useAlt = body.failOn === 'microservice2';

        // 1) Para el HTTP POST:
        const httpUrl = useAlt ? ALT_POST_URL : POST_URL;
        const status  = await postToExternalQueue(httpUrl, enriched);
        console.log('HTTP publicado, status:', status);

        // 2) Para Service Bus, si necesitas reenviar al bus alternativo:
        if (useAlt) {
          console.log('Reconectando a Service Bus alternativo…');
          const altClient = new ServiceBusClient(ALT_CONNECTION_STR);
          const altSender = altClient.createSender(TOPIC_NAME);
          await altSender.sendMessages({ body: enriched });
          console.log('Mensaje reenviado al bus alternativo');
          await altClient.close();
        }

      } catch (err) {
        console.error('Error procesando mensaje:', err.message);
      }
    },
    processError(err) {
      console.error('Error en receiver:', err);
    }
  });
}

start().catch(err => {
  console.error('Error inicializando worker:', err);
  process.exit(1);
});
