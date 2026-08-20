import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import roastRouter from './routes/roast.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS — allow local dev + any Vercel deploy
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    /\.vercel\.app$/,
  ],
  methods: ['GET', 'POST'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/roast', roastRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '🔥 Form Check Roast API is alive' });
});

app.listen(PORT, () => {
  console.log(`\n🔥 Form Check Roast server running on http://localhost:${PORT}`);
  console.log(`   Gemini key: ${process.env.GEMINI_API_KEY ? '✅ loaded' : '❌ missing!'}\n`);
});
