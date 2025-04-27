// worker.ts
import axios from 'axios';

const BASE_URL = 'https://house-inventory-devops-production.up.railway.app/api/v2';
const SERVICE_NAME = 'microservice2';         // Ajusta tu nombre
const QUEUE_SERVICE = 'queue-ms';             // Siempre queue-ms

async function consumeAndProcess() {
  try {
    // 1) Consumir mensajes (necesitamos confirmar método/endpoint exacto)
    const { data: messages } = await axios.get(
      `${BASE_URL}/messages/consume`,         // <-- confirmar ruta
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Source': SERVICE_NAME,
          'X-Destination': QUEUE_SERVICE,
        },
      }
    );
    
    for (const raw of messages) {
      // 2) Parsear payload interno
      const inner = JSON.parse(raw.message);
      
      // 3) Agregar tus datos al mensaje
      inner.processedBy = SERVICE_NAME;
      // Mantener inner.sendTo igual al original

      // 4) Volver a publicar para avanzar saga
      await axios.post(
        `${BASE_URL}/messages/publish`,
        {
          message: JSON.stringify(inner),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Source': SERVICE_NAME,
            'X-Destination': QUEUE_SERVICE,
          },
        }
      );
    }
  } catch (err) {
    console.error('Error en worker:', err);
  } finally {
    // 5) Esperar antes de volver a consultar
    setTimeout(consumeAndProcess, 2000);
  }
}

// Iniciar el ciclo
consumeAndProcess();
