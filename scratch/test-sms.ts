import { sendSms } from '../lib/sendSms';

async function main() {
  const to = '+573133087069';
  const message = 'Hola, el pago fue exitoso y puede ver su reserva en el calendario. (Mensaje de prueba)';
  
  console.log(`Enviando SMS a ${to}...`);
  
  const result = await sendSms(to, message);
  
  if (result.success) {
    console.log('✅ SMS enviado exitosamente.');
    console.log('SID:', result.sid);
    console.log('Status:', result.status);
  } else {
    console.error('❌ Error enviando SMS:', result.error);
  }
}

main().catch(console.error);
