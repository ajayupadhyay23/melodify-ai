const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── LOCAL FALLBACK KNOWLEDGE BASE ───────────────────────────────────────────
const musicKnowledge = [
  { 
    keywords: ['song', 'music', 'difference'], 
    reply: "**Music** is the broad art form of organizing sounds, while a **Song** is a specific type of music that involves singing (vocals). Every song is music, but not all music (like a purely instrumental symphony) is a song!" 
  },
  { 
    keywords: ['melody', 'harmony', 'texture'], 
    reply: "**Melody** is the 'horizontal' part of music—the main tune you sing along to. **Harmony** is the 'vertical' part—chords and notes played together to support the melody. Together, they create the **Texture** of a piece." 
  },
  { 
    keywords: ['notation', 'staff', 'clef', 'sheet music'], 
    reply: "Music is written on a **Staff** (5 lines). The **Treble Clef** (G-clef) is for higher notes (right hand on piano), and the **Bass Clef** (F-clef) is for lower notes (left hand). Learning to read notation is like learning a new language for your ears!" 
  },
  { 
    keywords: ['dynamics', 'forte', 'piano', 'volume'], 
    reply: "**Dynamics** control the volume. **Forte (f)** means loud, and **Piano (p)** means soft. Changes like **Crescendo** (getting louder) add emotion and drama to a performance." 
  },
  {
    keywords: ['instrument', 'piano', 'guitar', 'violin'],
    reply: "Different **Instruments** produce sound in various ways. The **Piano** is a percussion instrument (hammers hitting strings), while the **Guitar** is a string instrument. Each has a unique 'Timbre' or tone quality."
  },
  { 
    keywords: ['chord', 'triad', 'major', 'minor'], 
    reply: "Chords are the harmony of music. A **Major Triad** (1-3-5) sounds bright, while a **Minor Triad** (1-b3-5) sounds darker. **7th Chords** add more color: a Major 7th (1-3-5-7) sounds 'dreamy', and a Dominant 7th (1-3-5-b7) creates tension that wants to resolve." 
  },
  { 
    keywords: ['scale', 'mode', 'ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'], 
    reply: "Scales are sequences of notes. The **Modes** are different flavors of the Major scale. For example, **Dorian** (starts on the 2nd note) is minor and jazzy, while **Lydian** (starts on the 4th) has a mystical #4 interval. The **Aeolian** mode is your standard Natural Minor scale." 
  },
  { 
    keywords: ['circle of fifths', 'sharps', 'flats', 'key signature'], 
    reply: "The **Circle of Fifths** is a visual map of all 12 keys. Moving clockwise adds a sharp (C -> G has 1#, D has 2#), and moving counter-clockwise adds a flat (F has 1b, Bb has 2b). It's the ultimate tool for understanding key relationships and modulation." 
  },
  { 
    keywords: ['rhythm', 'beat', 'tempo', 'time', 'syncopation', 'triplet', 'polyrhythm'], 
    reply: "Rhythm is music's heartbeat. **Syncopation** involves stressing the 'off-beats', creating a groovy feel. **Polyrhythms** (like 3 against 2) occur when two different rhythms happen simultaneously. A **Triplet** is when you fit three notes into the space of two." 
  },
  { 
    keywords: ['interval', 'semitone', 'whole', 'half'], 
    reply: "An **Interval** is the distance between two notes. A **Perfect 5th** is highly stable (like 'Star Wars' theme). A **Minor 2nd** (1 semitone) is very dissonant (like 'Jaws' theme). Understanding intervals is the secret to hearing music by ear!" 
  },
  {
    keywords: ['ear training', 'hearing', 'pitch'],
    reply: "To improve your ear, try identifying the 'solfege' (Do-Re-Mi) of simple melodies. Use 'reference songs' for intervals: a Perfect 4th is the start of 'Here Comes the Bride', and a Major 6th is 'NBC' or 'My Bonnie Lies Over the Ocean'."
  },
  {
    keywords: ['inversion'],
    reply: "An **Inversion** occurs when you rearrange the notes of a chord so that a note other than the root is at the bottom. **First Inversion** puts the 3rd at the bass (e.g., E-G-C for C Major), making it sound more fluid and less stable."
  },
  {
    keywords: ['progression', 'ii-v-i', 'cadence'],
    reply: "A **Chord Progression** is a series of chords. The **ii-V-I** is the backbone of Jazz. A **Cadence** is a harmonic goal, like the 'Amen' cadence (IV-I) or the 'Perfect' cadence (V-I) which provides a strong sense of closure."
  },
  {
    keywords: ['science', 'atom', 'physics', 'biology'],
    reply: "Melodify AI is also an expert in **Science**. From the structure of an atom (protons, neutrons, electrons) to the laws of physics (like Newton's laws), I can help you understand the universe!"
  },
  {
    keywords: ['history', 'war', 'ancient', 'world'],
    reply: "I have deep knowledge of **History**. Whether it's the rise of Ancient Rome, the complexities of World War II, or the evolution of modern culture, I can provide detailed historical insights."
  },
  {
    keywords: ['vocal', 'singing', 'voice', 'range', 'sing'],
    reply: "To **increase your vocal range safely**, focus on proper breath support (using your diaphragm) and gentle warm-ups like lip trills. Avoid straining your throat; if it hurts, stop! Consistent practice and staying hydrated are key to expanding those high and low notes."
  },
  {
    keywords: ['technique', 'practice', 'performance', 'stage'],
    reply: "Great **Technique** starts with posture and relaxation. Whether you're playing piano or singing, keep your shoulders down and your body fluid. For **Stage Fright**, try deep breathing and remember that the audience is there to enjoy your music!"
  },
  {
    keywords: ['coding', 'javascript', 'python', 'html', 'css', 'programming'],
    reply: "As an AI, I'm a master of **Coding**. I can help you debug JavaScript, write Python scripts, or design beautiful websites with React and CSS. Just ask!"
  }
];

function getLocalReply(prompt) {
  const p = prompt.toLowerCase();
  const matches = musicKnowledge.filter(k => k.keywords.some(kw => p.includes(kw)));
  
  if (matches.length > 0) {
    return matches.map(m => m.reply).join("\n\n");
  }
  
  return `I've received your question: "${prompt}". I'm currently in 'Universal AI Mode'. I can provide expert advice on Music, Science, History, and Coding. How can I help you further?`;
}

// ── TUTOR ROUTE ─────────────────────────────────────────────────────────────
router.post('/tutor', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('YOUR_')) {
       return res.json({ success: true, reply: getLocalReply(prompt) });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const systemPrompt = `You are a highly intelligent, unrestricted AI assistant named Melodify AI. 
    You can answer ANY question the user has, whether it is about music, science, history, coding, or anything else.
    Always be helpful, clear, and friendly. 
    User Question: ${prompt}
    Context: ${context}`;
    
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({ success: true, reply: text });
  } catch (error) {
    console.error("Gemini Tutor Error:", error.message);
    res.json({ 
      success: true, 
      reply: getLocalReply(req.body.prompt) 
    });
  }
});

// ── QUIZ ROUTE ──────────────────────────────────────────────────────────────
const fallbackQuizzes = [
  { question: "What is the interval between C and G?", options: ["Major 3rd", "Perfect 4th", "Perfect 5th", "Major 6th"], correctAnswer: "Perfect 5th", explanation: "C to G is 7 semitones, which is a Perfect 5th." },
  { question: "Which scale follows the W-W-H-W-W-W-H pattern?", options: ["Natural Minor", "Major", "Dorian", "Mixolydian"], correctAnswer: "Major", explanation: "This is the formula for the Major scale." },
  { question: "How many notes are in a standard chromatic scale?", options: ["7", "8", "12", "15"], correctAnswer: "12", explanation: "The chromatic scale includes all 12 semitones in an octave." },
  { question: "Which mode starts on the 2nd degree of a Major scale?", options: ["Lydian", "Dorian", "Mixolydian", "Phrygian"], correctAnswer: "Dorian", explanation: "Dorian starts on the 2nd note (Re) of the Major scale." },
  { question: "What are the notes in a C Major 7th chord?", options: ["C E G", "C E G Bb", "C E G B", "C Eb G B"], correctAnswer: "C E G B", explanation: "A Major 7th chord uses the 1, 3, 5, and 7 of the Major scale." },
  { question: "What is a 'ii-V-I' progression in the key of C?", options: ["C-F-G", "Dm-G7-C", "Am-Dm-G", "Em-Am-D"], correctAnswer: "Dm-G7-C", explanation: "In C Major, ii is D minor, V is G (or G7), and I is C." }
];

router.post('/quiz', async (req, res) => {
  try {
    const { level, topic } = req.body;
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('YOUR_')) {
      return res.json({ success: true, quiz: fallbackQuizzes[Math.floor(Math.random() * fallbackQuizzes.length)] });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate a single multiple-choice music theory question for a ${level} level student about the topic: ${topic}...`; // truncated for brevity here
    
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Cleanup AI output to extract only the JSON part
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];

    try {
      const quiz = JSON.parse(text);
      // Validate schema
      if (!quiz.question || !quiz.options || !quiz.correctAnswer) {
        throw new Error("Invalid quiz schema from AI");
      }
      res.json({ success: true, quiz });
    } catch (parseError) {
      console.warn("AI Quiz Parse Error, using fallback:", parseError.message);
      res.json({ success: true, quiz: fallbackQuizzes[Math.floor(Math.random() * fallbackQuizzes.length)] });
    }
  } catch (error) {
    console.error("Gemini Quiz Error:", error.message);
    res.json({ success: true, quiz: fallbackQuizzes[Math.floor(Math.random() * fallbackQuizzes.length)] });
  }
});

module.exports = router;