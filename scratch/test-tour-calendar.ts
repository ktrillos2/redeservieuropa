import { buildOrderEventPayload, createCalendarEvent } from '../lib/google-calendar';

async function testTourCalendar() {
  const mockService = {
    type: 'tour',
    title: 'Tour Panorámico de París (3 Horas)',
    date: '2027-10-15',
    time: '14:00',
    totalPrice: 405,
    passengers: 7,
    pickupAddress: 'Hotel Plaza',
    dropoffAddress: 'Disneyland',
    ninos: 2,
    payFullNow: false,
    depositPercent: 20
  };

  const mockPayment = {
    currency: 'EUR',
    method: 'creditcard',
    requestedMethod: 'creditcard',
    payFullNow: false,
    depositPercent: 20,
    paidAmount: 81
  };

  const mockContact = {
    name: 'Keyner Esteban (Test Tour)',
    email: 'test@example.com',
    phone: '+34 600 000 000'
  };

  console.log('Building payload...');
  const payload = buildOrderEventPayload({
    service: mockService,
    payment: mockPayment,
    contact: mockContact
  });

  console.log('Payload:', JSON.stringify(payload, null, 2));
  console.log('Creating calendar event...');
  
  try {
    const evt = await createCalendarEvent(payload, 'test_tour_' + Date.now(), true);
    console.log('Event created successfully!');
    console.log('Calendar Link:', evt.htmlLink);
  } catch (error: any) {
    console.error('Error creating calendar event:', error?.message || error);
  }
}

testTourCalendar().then(() => process.exit(0)).catch(console.error);
