const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.get('/conversations', authMiddleware, chatController.getConversations);
router.post('/conversations', authMiddleware, chatController.createConversation);
router.get('/conversations/:conversationId/messages', authMiddleware, chatController.getMessages);
router.post('/conversations/:conversationId/messages', authMiddleware, aiLimiter, chatController.sendMessage);

module.exports = router;
