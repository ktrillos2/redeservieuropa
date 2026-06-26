import { twilioClient } from '../lib/twilio';

async function main() {
  const sid = process.argv[2];
  if (!sid) {
    console.error('Por favor, proporciona el SID del mensaje como argumento.');
    process.exit(1);
  }

  if (!twilioClient) {
    console.error('El cliente de Twilio no está inicializado.');
    process.exit(1);
  }

  console.log(`Buscando información para el mensaje SID: ${sid}...`);
  try {
    const message = await twilioClient.messages(sid).fetch();
    console.log('--- DETALLES DEL MENSAJE ---');
    console.log('SID:', message.sid);
    console.log('De (From):', message.from);
    console.log('Para (To):', message.to);
    console.log('Estado (Status):', message.status);
    console.log('Código de Error (Error Code):', message.errorCode);
    console.log('Mensaje de Error (Error Message):', message.errorMessage);
    console.log('Precio:', message.price, message.priceUnit);
    console.log('Fecha de Creación:', message.dateCreated);
  } catch (error) {
    console.error('Error al recuperar detalles de Twilio:', error);
  }
}

main();
