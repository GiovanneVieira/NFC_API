import mqtt from 'mqtt';

const BROKER_URL = process.env.MQTT_BROKER_URL ?? 'mqtt://localhost:1883';
const TOPIC = 'facens/nfc/chamada';

const cardUid = process.env.NFC_CARD_UID ?? 'DEMO-CARD-001';
const receptorId = process.env.NFC_RECEPTOR_ID ?? 'sala-C29';

const payload = JSON.stringify({
  cardUid,
  receptorId,
});

const client = mqtt.connect(BROKER_URL, {
  reconnectPeriod: 2000,
  connectTimeout: 5000,
});

client.on('connect', () => {
  console.log(`Conectado ao broker em ${BROKER_URL}`);
  client.publish(TOPIC, payload, { qos: 1 }, (err) => {
    if (err) {
      console.error('Erro ao publicar:', err.message);
    } else {
      console.log(`Publicado em "${TOPIC}": ${payload}`);
    }
    client.end();
  });
});

client.on('error', (err) => {
  console.error('Erro de conexao MQTT:', err.message);
  process.exit(1);
});