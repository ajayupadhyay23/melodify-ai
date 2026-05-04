const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function findWorkingModel() {
  const modelsToTest = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.0-pro',
    'gemini-pro',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemma-2-9b-it',
    'gemma-3-4b-it'
  ];

  for (const modelName of modelsToTest) {
    console.log(`Testing model: ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hi');
      console.log(`✅ SUCCESS: ${modelName} is working!`);
      return modelName;
    } catch (err) {
      console.log(`❌ FAILED: ${modelName} - ${err.message}`);
    }
  }
  return null;
}

findWorkingModel().then(working => {
  if (working) console.log(`\nFound working model: ${working}`);
  else console.log(`\nNo working models found. Check API key status or project restrictions.`);
});
