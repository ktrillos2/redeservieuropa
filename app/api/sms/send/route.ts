import { NextRequest, NextResponse } from 'next/server';
import { twilioClient } from '@/lib/twilio';

export async function POST(req: NextRequest) {
  try {
    const internalKey = process.env.INTERNAL_SMS_API_KEY;
    const providedKey = req.headers.get('x-api-key');

    if (!internalKey || providedKey !== internalKey) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!twilioClient) {
      return NextResponse.json({ success: false, error: 'Twilio is not configured on the server' }, { status: 500 });
    }

    const body = await req.json();
    const { to, message } = body;

    if (!to || typeof to !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing or invalid "to" number' }, { status: 400 });
    }

    // Basic E.164 international format validation: + followed by 10 to 15 digits
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    if (!phoneRegex.test(to)) {
      return NextResponse.json({ success: false, error: 'Phone number must be in E.164 international format (e.g., +573001234567)' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json({ success: false, error: 'Missing or invalid "message"' }, { status: 400 });
    }

    if (message.length > 1600) {
      return NextResponse.json({ success: false, error: 'Message exceeds maximum length' }, { status: 400 });
    }

    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    if (!messagingServiceSid) {
      return NextResponse.json({ success: false, error: 'Messaging Service SID not configured' }, { status: 500 });
    }

    const response = await twilioClient.messages.create({
      to,
      body: message,
      messagingServiceSid
    });

    return NextResponse.json({ 
      success: true, 
      sid: response.sid,
      status: response.status 
    });

  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
