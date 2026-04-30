require('dotenv').config();
const express = require('express');
const cors = require('cors');
const aiRoutes = require('./src/routes/ai');
const dbRoutes = require('./src/routes/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/db', dbRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', msg: 'AI Music Trainer Backend Running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});