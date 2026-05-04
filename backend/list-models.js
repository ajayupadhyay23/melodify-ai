const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function check() {
  const key = process.env.GEMINI_API_KEY;
  console.log('Checking key starting with:', key.substring(0, 10));
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key);
    const data = await res.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

check();
