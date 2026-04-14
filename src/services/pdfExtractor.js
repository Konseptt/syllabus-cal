/**
 * pdfExtractor.js
 * Extracts text content from uploaded PDF files using pdf.js.
 * Runs entirely client-side — no server needed.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Point pdf.js to its bundled worker (Vite resolves this automatically)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

/**
 * Reads a PDF File object and returns all text content as a string.
 * @param {File} file - The uploaded PDF file
 * @returns {Promise<string>} - Concatenated text from every page
 */
export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Combine all text items, preserving rough spacing
    const pageText = content.items
      .map((item) => item.str)
      .join(' ');

    pages.push(pageText);
  }

  return pages.join('\n\n');
}
