const { v4: uuidv4 } = require('uuid');
const dbService = require('../services/dbService');
const aiService = require('../services/aiService');

const chatController = {
  async getConversations(req, res, next) {
    try {
      const conversations = await dbService.getConversations(req.user.id);
      res.json({ success: true, conversations });
    } catch (err) {
      next(err);
    }
  },

  async createConversation(req, res, next) {
    try {
      const { title } = req.body;
      const convId = `conv_${uuidv4().slice(0, 10)}`;
      const newConv = {
        id: convId,
        title: title || 'New Study Session',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await dbService.saveConversation(req.user.id, newConv);
      res.status(201).json({ success: true, conversation: newConv });
    } catch (err) {
      next(err);
    }
  },

  async getMessages(req, res, next) {
    try {
      const { conversationId } = req.params;
      const messages = await dbService.getMessages(req.user.id, conversationId);
      res.json({ success: true, messages });
    } catch (err) {
      next(err);
    }
  },

  async sendMessage(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { message, context } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ success: false, error: 'Message cannot be empty.' });
      }

      // 1. Save user message
      const userMsg = {
        id: `msg_${uuidv4()}`,
        conversationId,
        sender: 'user',
        text: message.trim(),
        timestamp: new Date().toISOString()
      };
      await dbService.saveMessage(req.user.id, userMsg);

      // 2. Fetch recent conversation history for context
      const history = await dbService.getMessages(req.user.id, conversationId);

      // 3. Generate AI Tutor response
      const aiResponse = await aiService.generateTutorResponse({
        prompt: message,
        history,
        context: context || ''
      });

      // 4. Save AI message
      const botMsg = {
        id: `msg_${uuidv4()}`,
        conversationId,
        sender: 'assistant',
        text: aiResponse.answer,
        provider: aiResponse.provider,
        timestamp: new Date().toISOString()
      };
      await dbService.saveMessage(req.user.id, botMsg);

      // Update conversation title if first message
      if (history.length <= 1) {
        const titleSnippet = message.slice(0, 32) + (message.length > 32 ? '...' : '');
        await dbService.saveConversation(req.user.id, {
          id: conversationId,
          title: titleSnippet
        });
      }

      res.json({
        success: true,
        userMessage: userMsg,
        assistantMessage: botMsg
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = chatController;
