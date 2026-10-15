const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const dbService = require('../services/dbService');
const pdfService = require('../services/pdfService');
const vectorService = require('../services/vectorService');

const documentController = {
  async uploadPDF(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No PDF file uploaded. Please select a valid .pdf file.'
        });
      }

      const file = req.file;
      const originalName = file.originalname;
      const fileSize = file.size;
      const filePath = file.path;

      // Validate MIME type / extension
      if (!originalName.toLowerCase().endsWith('.pdf') && file.mimetype !== 'application/pdf') {
        // cleanup uploaded temp file
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(400).json({
          success: false,
          error: 'Invalid file format. Only PDF documents (.pdf) are supported.'
        });
      }

      const docId = `doc_${uuidv4().slice(0, 10)}`;
      const docRecord = {
        id: docId,
        userId: req.user.id,
        title: originalName.replace(/\.pdf$/i, ''),
        fileName: originalName,
        fileSize: `${(fileSize / (1024 * 1024)).toFixed(2)} MB`,
        uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        createdAt: new Date().toISOString(),
        status: 'processing',
        pagesCount: 0,
        chunksCount: 0
      };

      // Save initial record
      await dbService.saveDocument(req.user.id, docRecord);

      // Extract text & pages
      const parsedData = await pdfService.extractTextAndPages(filePath);
      
      // Chunk document
      const chunks = pdfService.chunkDocument(docId, docRecord.title, parsedData.pages);

      // Generate embeddings for chunks
      const embeddedChunks = await Promise.all(
        chunks.map(async (c) => {
          const emb = await vectorService.generateEmbedding(c.content);
          return {
            ...c,
            embedding: emb
          };
        })
      );

      // Store chunks
      await dbService.saveChunks(req.user.id, docId, embeddedChunks);

      // Update document record
      docRecord.status = 'ready';
      docRecord.pagesCount = parsedData.numpages || 1;
      docRecord.chunksCount = embeddedChunks.length;
      await dbService.saveDocument(req.user.id, docRecord);

      // Remove temp file from disk if desired or keep in uploads
      res.status(201).json({
        success: true,
        message: 'PDF processed and indexed for RAG successfully!',
        document: docRecord
      });
    } catch (err) {
      console.error('[DocumentController] Upload error:', err);
      next(err);
    }
  },

  async getDocuments(req, res, next) {
    try {
      const documents = await dbService.getDocuments(req.user.id);
      res.json({
        success: true,
        documents: documents || []
      });
    } catch (err) {
      next(err);
    }
  },

  async getDocumentById(req, res, next) {
    try {
      const doc = await dbService.getDocumentById(req.user.id, req.params.id);
      if (!doc) {
        return res.status(404).json({ success: false, error: 'Document not found or access denied.' });
      }
      res.json({ success: true, document: doc });
    } catch (err) {
      next(err);
    }
  },

  async deleteDocument(req, res, next) {
    try {
      const deleted = await dbService.deleteDocument(req.user.id, req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Document not found or unauthorized.' });
      }
      res.json({ success: true, message: 'Document and RAG embeddings removed successfully.' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = documentController;
