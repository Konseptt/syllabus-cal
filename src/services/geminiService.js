/**
 * geminiService.js
 * Calls our backend API to extract events from syllabus text.
 * The backend handles the Gemini API key and rate limiting.
 */

/**
 * Send syllabus text to the backend for AI extraction.
 * @param {string} syllabusText - Raw text from the PDF
 * @returns {Promise<{events: Array, courseName: string, semester: string}>}
 */
export async function extractEvents(syllabusText) {
  const response = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: syllabusText }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Server error (${response.status})`);
  }

  return response.json();
}
