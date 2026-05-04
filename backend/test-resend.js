const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
  console.log('Testing Resend API Key...');
  try {
    const { data, error } = await resend.emails.send({
      from: 'Melodify AI <onboarding@resend.dev>',
      to: ['delivered@resend.dev'],
      subject: 'Test OTP',
      html: '<p>123456</p>'
    });
    if (error) console.log('❌ FAILED:', error.message);
    else console.log('✅ SUCCESS:', data.id);
  } catch (err) {
    console.log('❌ ERROR:', err.message);
  }
}

testResend();
