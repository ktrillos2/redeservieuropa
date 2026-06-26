import { twilioClient } from './twilio';

/**
 * Sends an SMS message using the Twilio client.
 * This should ONLY be called from backend contexts (API routes, Server Actions, Server Components).
 *
 * @param to - The recipient's phone number in E.164 format (e.g., +573001234567)
 * @param message - The body of the SMS message
 * @returns An object containing success status and sid/status if successful
 */
export async function sendSms(to: string, message: string) {
  if (!twilioClient) {
    throw new Error('Twilio client is not initialized. Check your environment variables.');
  }

  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  if (!messagingServiceSid) {
    throw new Error('TWILIO_MESSAGING_SERVICE_SID is missing in environment variables.');
  }

  try {
    const response = await twilioClient.messages.create({
      to,
      body: message,
      messagingServiceSid
    });

    return {
      success: true,
      sid: response.sid,
      status: response.status
    };
  } catch (error: any) {
    console.error('Failed to send SMS via helper:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred while sending SMS'
    };
  }
}

// Example usage:
// import { sendSms } from '@/lib/sendSms';
// 
// async function notifyUser() {
//   const result = await sendSms('+573001234567', 'Hola, tu reserva ha sido confirmada!');
//   if (result.success) {
//     console.log('Message sent! SID:', result.sid);
//   } else {
//     console.error('Failed:', result.error);
//   }
// }
