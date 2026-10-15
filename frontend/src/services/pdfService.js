// Browser-side PDF processing using pdfjs-dist
import * as pdfjsLib from 'pdfjs-dist';

// Set worker - use CDN for simplicity
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text from a PDF File object, page by page
 */
export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(' ').trim();
    if (text) {
      pages.push({ pageNumber: i, text });
    }
  }

  return {
    numpages: pdf.numPages,
    pages,
    fullText: pages.map(p => p.text).join('\n\n'),
  };
}

/**
 * Chunk pages into overlapping text segments with metadata
 */
export function chunkDocument(documentId, documentTitle, pages, chunkSizeWords = 180, overlapWords = 30) {
  const chunks = [];
  let chunkIndex = 0;

  for (const page of pages) {
    const text = (page.text || '').replace(/\s+/g, ' ').trim();
    if (!text) continue;

    const words = text.split(' ');

    if (words.length <= chunkSizeWords) {
      chunks.push({
        id: `chk_${documentId}_${chunkIndex}`,
        documentId,
        documentTitle,
        pageNumber: page.pageNumber,
        chunkIndex: chunkIndex++,
        content: text,
        wordCount: words.length,
      });
      continue;
    }

    let start = 0;
    while (start < words.length) {
      const end = Math.min(start + chunkSizeWords, words.length);
      const chunkText = words.slice(start, end).join(' ').trim();

      if (chunkText.length > 20) {
        chunks.push({
          id: `chk_${documentId}_${chunkIndex}`,
          documentId,
          documentTitle,
          pageNumber: page.pageNumber,
          chunkIndex: chunkIndex++,
          content: chunkText,
          wordCount: end - start,
        });
      }

      if (end >= words.length) break;
      start += chunkSizeWords - overlapWords;
    }
  }

  return chunks;
}

/**
 * Simple TF-based keyword similarity search (no embeddings needed)
 */
export function findSimilarChunks(query, chunks, topK = 4, threshold = 0.05) {
  if (!chunks || chunks.length === 0) return [];

  const stopwords = new Set(['a','an','the','is','it','in','on','at','to','for','of','and','or','but','not','with','this','that','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','may','might','can','i','you','he','she','we','they','what','how','why','when','where','which']);

  function tokenize(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w));
  }

  const queryTokens = new Set(tokenize(query));

  const scored = chunks.map(chunk => {
    const chunkTokens = tokenize(chunk.content);
    const chunkSet = new Set(chunkTokens);
    let matches = 0;
    for (const t of queryTokens) {
      if (chunkSet.has(t)) matches++;
    }
    const score = queryTokens.size > 0 ? matches / queryTokens.size : 0;
    return { ...chunk, score: parseFloat(score.toFixed(4)), relevancePercentage: Math.round(score * 100) };
  });

  return scored
    .filter(c => c.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
