# SyllabusCal 📅

**SyllabusCal** is an elegant, open-source academic tool built to instantly convert your university syllabus PDFs into Google Calendar templates. It utilizes an Academic Brutalism design aesthetic to minimize "AI slop" and maximize legible execution. 

By running unstructured PDF data through an NVIDIA-hosted LLaMA 3.1 LLM, this application isolates academic deadlines, exams, and labs seamlessly and returns them as a `.ics` stream.

## Features

- **Automated Text Extraction**: Built entirely using `pdfjs-dist` to parse academic syllabi directly on a browser thread.
- **LLaMA Academic Parsing**: Processes syllabus blocks aggressively to extract assignments and return standard schema.
- **Privacy by Design**: Strictly memory-bound environment. No payloads are written to disk. All transactions utilize TLS-wrapped REST structures and payloads are destroyed immediately post-parse.
- **Backend Architecture Defense**: Hosted securely utilizing Express Helmet controls (HSTS), distributed local rate limiting strategies, and deep regex DLP triggers blocking highly restricted information (SSN/CC).

## Tech Stack

- **Frontend**: React 19 / Vite 8 
- **Backend API Proxy**: Node.js / Express 5
- **Aesthetic Core**: Vanilla CSS (Academic Neo-Brutalism)
- **AI Interface**: NVIDIA NIM API Endpoint (`meta/llama-4-maverick-17b-128e-instruct`)

## Local Installation

Ensure you have Node.js available in your environment variables.

1. **Clone the Repo**
   ```bash
   git clone https://github.com/Konseptt/syllabus-cal.git
   cd syllabus-cal
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Keys**
   Create a `.env` file in the root directory and inject your standard NVIDIA Build API credentials:
   ```env
   NVIDIA_API_KEY=your_nvidia_api_key_here
   PORT=3001
   ```

4. **Launch the Servers**
   To launch the frontend Vite instance and the backend LLM proxy server simultaneously:
   ```bash
   npm run dev
   ```
   Navigate to `localhost:5173` in your browser.

## Contributing

Designed exclusively for students, academics, and schedule management. Contributions to the aesthetic or the extraction mechanisms are heavily welcomed. Fork the standard repo, configure an NVIDIA NIM developer token, and submit a PR!
