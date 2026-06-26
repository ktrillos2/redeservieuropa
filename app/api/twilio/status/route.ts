import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const messageSid = formData.get('MessageSid');
    const messageStatus = formData.get('MessageStatus');
    const to = formData.get('To');
    const from = formData.get('From');
    const errorCode = formData.get('ErrorCode');

    console.log('--- Twilio SMS Status Callback ---');
    console.log(`MessageSid: ${messageSid}`);
    console.log(`Status: ${messageStatus}`);
    console.log(`To: ${to}`);
    console.log(`From: ${from}`);
    if (errorCode) {
      console.log(`ErrorCode: ${errorCode}`);
    }
    console.log('----------------------------------');

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling Twilio status callback:', error);
    // Always return a success response to Twilio to stop retries unless it's a fatal error you want retried
    return NextResponse.json({ received: false }, { status: 500 });
  }
}
