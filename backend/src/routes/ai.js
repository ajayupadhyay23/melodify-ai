const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/tutor', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const systemPrompt = `You are a friendly, expert music theory tutor. Keep your explanations concise, encouraging, and beginner-friendly. Answer the user's question:\n\nUser Question: ${prompt}\n\nMusic context/Level: ${context}`;
    
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({ success: true, reply: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch AI response', details: error.message });
  }
});

router.post('/quiz', async (req, res) => {
  try {
    const { level, topic } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Fixed prompt: correctAnswer must be the full text of the correct option
    const prompt = `Generate a single multiple-choice music theory question for a ${level} level student about the topic: ${topic}.

Return ONLY a valid JSON object. No markdown, no code blocks, no extra text. Use this exact structure:
{
  "question": "Write the full question here?",
  "options": ["Full text of option 1", "Full text of option 2", "Full text of option 3", "Full text of option 4"],
  "correctAnswer": "Full text of the correct option — must exactly match one of the options array values",
  "explanation": "Brief explanation of why the answer is correct"
}

CRITICAL: The correctAnswer field must be the EXACT same string as one of the values in the options array.`;
    
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Clean up any markdown formatting
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    
    // Extract JSON if there's extra text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];

    const quiz = JSON.parse(text);

    // Validate correctAnswer exists in options
    if (!quiz.options.includes(quiz.correctAnswer)) {
      // Try to fix: if correctAnswer is a letter like "A", map to the actual option
      const letterMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
      const idx = letterMap[quiz.correctAnswer.toUpperCase()];
      if (idx !== undefined && quiz.options[idx]) {
        quiz.correctAnswer = quiz.options[idx];
      }
    }

    res.json({ success: true, quiz });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ success: false, error: 'Failed to generate quiz' });
  }
});

module.exports = router;