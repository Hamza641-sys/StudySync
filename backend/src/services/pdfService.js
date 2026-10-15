const fs = require('fs');
const pdfParse = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');

const pdfService = {
  /**
   * Parse PDF buffer/file and extract text along with page boundaries
   */
  async extractTextAndPages(filePath) {
    const dataBuffer = fs.readFileSync(filePath);

    let pageTexts = [];
    const options = {
      pagerender: function (pageData) {
        return pageData.getTextContent().then(function (textContent) {
          let lastY, text = '';
          for (let item of textContent.items) {
            if (lastY == item.transform[5] || !lastY) {
              text += item.str;
            } else {
              text += '\n' + item.str;
            }
            lastY = item.transform[5];
          }
          pageTexts.push({
            pageNumber: pageData.pageNumber || (pageTexts.length + 1),
            text: text.trim()
          });
          return text;
        });
      }
    };

    try {
      const parsed = await pdfParse(dataBuffer, options);
      
      // Fallback if custom pagerender wasn't called per page
      if (pageTexts.length === 0 && parsed.text) {
        // split rough pages if needed or treat as page 1
        pageTexts.push({
          pageNumber: 1,
          text: parsed.text.trim()
        });
      }

      return {
        numpages: parsed.numpages || pageTexts.length || 1,
        info: parsed.info || {},
        pages: pageTexts,
        fullText: parsed.text || pageTexts.map(p => p.text).join('\n\n')
      };
    } catch (err) {
      console.error('[PDFService] Error parsing PDF with pdf-parse:', err.message);
      // Fallback plain text read if file is text/corrupted pdf
      const rawText = dataBuffer.toString('utf8');
      return {
        numpages: 1,
        info: {},
        pages: [{ pageNumber: 1, text: rawText.slice(0, 10000) }],
        fullText: rawText.slice(0, 10000)
      };
    }
  },

  /**
   * Divide extracted pages into overlapping chunks with metadata
   * chunkWords ~ 150-250 words, overlap ~ 30 words
   */
  chunkDocument(documentId, documentTitle, pages, chunkSizeWords = 180, overlapWords = 30) {
    const chunks = [];
    let chunkIndex = 0;

    for (const page of pages) {
      const pageNum = page.pageNumber;
      const text = (page.text || '').replace(/\s+/g, ' ').trim();
      if (!text) continue;

      const words = text.split(' ');
      if (words.length <= chunkSizeWords) {
        chunks.push({
          id: `chk_${uuidv4()}`,
          documentId,
          documentTitle,
          pageNumber: pageNum,
          chunkIndex: chunkIndex++,
          content: text,
          wordCount: words.length
        });
        continue;
      }

      let start = 0;
      while (start < words.length) {
        const end = Math.min(start + chunkSizeWords, words.length);
        const chunkWords = words.slice(start, end);
        const chunkText = chunkWords.join(' ').trim();

        if (chunkText.length > 20) {
          chunks.push({
            id: `chk_${uuidv4()}`,
            documentId,
            documentTitle,
            pageNumber: pageNum,
            chunkIndex: chunkIndex++,
            content: chunkText,
            wordCount: chunkWords.length
          });
        }

        if (end >= words.length) break;
        start += (chunkSizeWords - overlapWords);
      }
    }

    return chunks;
  }
};

module.exports = pdfService;
