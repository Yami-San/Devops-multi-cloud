// worker.ts
import 'dotenv/config';   // 1) Carga .env antes de todo
import axios from 'axios';

const QUEUE_URL     = process.env.POST_URL!;      // p.ej. https://… up.railway.app/api/v2
const API_URL       = process.env.API_URL!;        // p.ej. http://34.123.45.67
const SERVICE_NAME  = 'microservice2';   // p.ej. microservice2
const QUEUE_SERVICE = 'queue-ms';  // p.ej. queue-ms

async function publishEntities() {
  try {
    // 2) Obtener datos de tu API interna (ECS)
    const [aviones, pilotos, seguros] = await Promise.all([
      axios.get(`${API_URL}/api/v2/aviones`),
      axios.get(`${API_URL}/api/v2/pilotos`),
      axios.get(`${API_URL}/api/v2/seguros`),
    ].map(p => p.then(res => res.data)));

    // 3) Construir el mensaje con tus entidades
    const payload = {
      type:    'data-sync',
      sendTo:  SERVICE_NAME,
      aviones,
      pilotos,
      seguros,
      processedBy: SERVICE_NAME,
    };

    // 4) Publicar en la cola
    const response = await axios.post(
      `${QUEUE_URL}/messages/publish`,
      { message: JSON.stringify(payload) },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Source':      SERVICE_NAME,
          'X-Destination': QUEUE_SERVICE,
        },
      }
    );

    console.log('Publicado en cola con status:', response.status);
  } catch (err) {
    console.error('Error publicando entidades:', err);
  }
}

// Invoca la función cuando necesites enviar tus datos
publishEntities();
