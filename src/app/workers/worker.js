// worker.ts
import 'dotenv/config';   // 1) Carga .env antes de todo
import axios from 'axios';

const QUEUE_URL     = process.env.POST_URL;      // p.ej. https://… up.railway.app/api/v2
const API_URL       = process.env.API_URL;        // p.ej. http://34.123.45.67
const SERVICE_NAME  = 'microservice2';   // p.ej. microservice2
const QUEUE_NAME  = 'coordinator'; 
const QUEUE_SERVICE = 'queue-ms';  // p.ej. queue-ms

if (!API_URL || !QUEUE_URL) {
  console.error('❌ Faltan variables de entorno: API_URL o POST_URL');
  process.exit(1);
}

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
      type:    '',
      sendTo:  SERVICE_NAME,
      failOn:  '',      // no definido aún
      error:   '',
      aviones,
      pilotos,
      seguros
    };

    // 4) Publicar en la cola
    const response = await axios.post(
      `${QUEUE_URL}/messages/publish`,
      { message: JSON.stringify(payload) },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Source':      QUEUE_NAME,
          'X-Destination': QUEUE_SERVICE,
        },
      }
    );

    console.log('Publicado en cola con status:', response.status);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error('❌ Error en Axios:', err.message);
      if (err.response) {
        console.error('  ↳ Response data:', err.response.data);
      } else if (err.request) {
        console.error('  ↳ No hubo respuesta:', err.request);
      }
    } else {
      console.error('❌ Error inesperado:', err);
    }
    process.exit(1);
  }
}

// Invoca la función cuando necesites enviar tus datos
publishEntities();
