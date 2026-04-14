# Syllabus to Calendar

Upload a syllabus PDF. AI extracts every due date, exam, and reading, exports a `.ics` file you import into Google Calendar in one click.

## Features
- **100% Secure**: Files are processed locally and text is extracted in your browser.
- **Smart Extraction**: Uses Google's Gemini AI to accurately pull all important dates and deadlines. 
- **Privacy-First**: No data is stored or logged. The extracted text is securely sent to the API and immediately discarded.

## Tech Stack
- Frontend: React + Vite (Glassmorphic dark UI)
- Backend: Express.js (API Proxy + Rate Limiting)
- PDF Extraction: `pdfjs-dist`
- AI Model: `gemini-2.0-flash-lite`

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on the example and add your Gemini API key:
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

3. Start both the frontend dev server and the local proxy backend:
   ```bash
   npm run dev
   ```

4. The app will be running at `http://localhost:5173`.

## Deployment
This app can be deployed to any Node.js hosting provider (like Render, Railway, or Heroku). It is no longer suitable for static GitHub Pages because it now requires a Node.js backend to securely proxy the Gemini API calls and handle rate limiting. 

For deployment:
1. Set the `GEMINI_API_KEY` environment variable on your host.
2. The build command is `npm run build`.
3. The start command is `npm start`.
