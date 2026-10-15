const { v4: uuidv4 } = require('uuid');
const dbService = require('../services/dbService');
const aiService = require('../services/aiService');

const summaryController = {
  async generateSummary(req, res, next) {
    try {
      const { text, documentId, summaryType = 'detailed', title } = req.body;

      let contentToSummarize = text;
      let docTitle = title || 'Study Notes';

      // If documentId provided, retrieve document chunks
      if (documentId && !text) {
        const doc = await dbService.getDocumentById(req.user.id, documentId);
        if (!doc) {
          return res.status(404).json({ success: false, error: 'Selected document not found.' });
        }
        docTitle = doc.title;
        const chunks = await dbService.getChunksByUser(req.user.id, documentId);
        contentToSummarize = chunks.map(c => c.content).join('\n\n');
      }

      if (!contentToSummarize || !contentToSummarize.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Please provide text or select a valid document to summarize.'
        });
      }

      const result = await aiService.generateSummary({
        text: contentToSummarize,
        summaryType,
        documentTitle: docTitle
      });

      const summaryRecord = {
        id: `sum_${uuidv4().slice(0, 10)}`,
        title: docTitle,
        type: summaryType,
        content: result.summary,
        originalLength: contentToSummarize.length,
        documentId: documentId || null,
        provider: result.provider,
        createdAt: new Date().toISOString()
      };

      // Automatically save to user's saved summaries
      await dbService.saveSummary(req.user.id, summaryRecord);

      res.json({
        success: true,
        summary: summaryRecord
      });
    } catch (err) {
      next(err);
    }
  },

  async getSummaries(req, res, next) {
    try {
      const summaries = await dbService.getSummaries(req.user.id);
      res.json({
        success: true,
        summaries: summaries || []
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = summaryController;
