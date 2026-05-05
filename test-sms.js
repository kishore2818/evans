import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

console.log('--- Testing Twilio Configuration ---');
console.log('SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('From:', process.env.TWILIO_PHONE_NUMBER);
console.log('Attempting to send test SMS...');

client.messages.create({
  body: 'Twilio Test from Evans Luxe Beauty. If you receive this, your configuration is correct!',
  from: process.env.TWILIO_PHONE_NUMBER,
  to: '+919597277150' // Using the number you provided earlier for testing
})
.then(message => {
  console.log('✅ SUCCESS! Message SID:', message.sid);
  console.log('Check your phone +919597277150 for the test SMS.');
})
.catch(err => {
  console.error('❌ FAILED!');
  console.error('Error Code:', err.code);
  console.error('Error Message:', err.message);
  console.log('\n--- Troubleshooting Tips ---');
  if (err.code === 21606) {
    console.log('The "From" number is likely not an SMS-capable number (or it is a WhatsApp number).');
  } else if (err.code === 21211) {
    console.log('The "To" number is invalid.');
  } else if (err.status === 401) {
    console.log('Invalid Account SID or Auth Token.');
  }
});
