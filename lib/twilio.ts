import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKeySid = process.env.TWILIO_API_KEY_SID;
const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;

if (!accountSid || !apiKeySid || !apiKeySecret) {
  console.warn("Missing Twilio credentials in environment variables. SMS features will not work.");
}

export const twilioClient = accountSid && apiKeySid && apiKeySecret 
  ? twilio(apiKeySid, apiKeySecret, { accountSid }) 
  : null;
