const dbService = require('../services/dbService');
const vectorService = require('../services/vectorService');
const aiService = require('../services/aiService');

const ragController = {
  async askQuestion(req, res, next) {
    const startTime = Date.now();
    try {
      const { question, documentId } = req.body;

      if (!question || !question.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Question prompt is required.'
        });
      }

      // 1. Fetch chunks belonging strictly to this user
      const chunks = await dbService.getChunksByUser(req.user.id, documentId || null);

      if (!chunks || chunks.length === 0) {
        return res.json({
          success: true,
          answer: "Aapke study library mein abhi koi indexed document nahi hai. Barah-e-karam pehle 'My Documents' mein jakar apni PDF study material upload karein, phir RAG question poochhein!",
          sources: [],
          pipeline: {
            retrievedCount: 0,
            latencyMs: Date.now() - startTime,
            status: 'no_documents'
          }
        });
      }

      // 2. Vector search & Rank top relevant chunks
      const relevantChunks = await vectorService.findSimilarChunks(question, chunks, 3, 0.08);

      // 3. Generate grounded answer
      const result = await aiService.generateRAGAnswer({
        question,
        relevantChunks
      });

      const latencyMs = Date.now() - startTime;

      res.json({
        success: true,
        answer: result.answer,
        sources: result.sources || [],
        grounded: result.grounded,
        provider: result.provider,
        pipeline: {
          retrievedCount: relevantChunks.length,
          totalChunksSearched: chunks.length,
          latencyMs,
          status: relevantChunks.length > 0 ? 'grounded_success' : 'no_relevant_context'
        }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = ragController;
