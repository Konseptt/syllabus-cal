import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// keep the api key secured in the backend so people can't steal it
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_MODEL = 'meta/llama-4-maverick-17b-128e-instruct';
const NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

if (!NVIDIA_API_KEY) {
  console.error('bro you forgot to set the NVIDIA_API_KEY in .env file :(');
  process.exit(1);
}

// set up basic security and cors
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' })); // 5mb should be plenty for raw syllabus text

// rate limiting so we don't go broke on the free tier lmao (10 reqs/min)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'calm down, too many requests. wait a minute.',
  },
});

const SYSTEM_PROMPT = `You are an expert academic assistant. Extract every important date from this university syllabus.

Rules:
1. Extract ALL assignments, homework, projects, exams, midterms, finals, quizzes, readings, labs, and deadlines.
2. Use clear, descriptive titles (e.g. "Homework 3: Arrays and Loops").
3. Dates in ISO format (YYYY-MM-DD). Calculate actual dates from "Week 5" etc. using context.
4. Include times in 24h format if mentioned. Leave as empty string if not specified.
5. Set the type field accurately to one of: ["exam", "assignment", "reading", "lab", "lecture", "other"].
6. Do NOT skip any events. Be thorough.

OUTPUT FORMAT:
You must output ONLY valid JSON matching this schema exactly. Do not add markdown blocks or conversational text.
{
  "events": [
    {
      "title": "Short descriptive title",
      "date": "YYYY-MM-DD",
      "time": "HH:MM or empty",
      "endTime": "HH:MM or empty",
      "type": "exam|assignment|reading|lab|lecture|other",
      "description": "Additional details"
    }
  ],
  "courseName": "Name of course",
  "semester": "Semester string"
}`;

/**
 * Call NVIDIA API with retry logic for rate limits.
 */
async function callLLM(syllabusText) {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(NVIDIA_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Syllabus text:\n\n${syllabusText}` }
        ],
        temperature: 0.1,
        max_tokens: 2000
      }),
    });

    // Handle rate limiting
    if (response.status === 429) {
      if (attempt < maxRetries - 1) {
        const waitMs = Math.pow(2, attempt + 1) * 1000;
        console.log(`Rate limited, retrying in ${waitMs / 1000}s...`);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      throw new Error('API rate limit reached. Please try again in a minute.');
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    let rawText = data?.choices?.[0]?.message?.content;

    if (!rawText) {
      throw new Error('Empty response from LLM API.');
    }

    // Sometimes models wrap in markdown ```json ... ``` blocks
    rawText = rawText.trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(rawText);

    // Sort events by date
    if (parsed.events) {
      parsed.events.sort((a, b) => a.date.localeCompare(b.date));
    }

    return parsed;
  }
}

// ============ API Routes ============

// the main brains of the operation: gets syllabus text, hands back structured json 
app.post('/api/extract', apiLimiter, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing "text" field in request body.' });
    }

    if (text.trim().length < 50) {
      return res.status(400).json({ error: 'Text is too short to be a syllabus.' });
    }

    // block obvious SSNs or credit cards so we don't get in trouble lol
    const dlpRegex = /\b\d{3}-\d{2}-\d{4}\b|\b(?:[0-9]{4}[ -]?){3}[0-9]{4}\b/;
    if (dlpRegex.test(text)) {
      return res.status(403).json({ error: 'yo please remove your SSN or credit card from the syllabus first, kinda sketchy to upload that.' });
    }

    // trim it down just in case someone uploads a 500 page book by accident
    const trimmedText = text.slice(0, 100000);

    const result = await callLLM(trimmedText);
    res.json(result);
  } catch (err) {
    console.error('Extract error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// basic health check to see if server is alive
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: NVIDIA_MODEL });
});

// Export the Express app for Vercel Serverless Functions
export default app;
