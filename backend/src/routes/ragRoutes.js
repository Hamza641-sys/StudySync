const express = require('express');
const router = express.Router();
const ragController = require('../controllers/ragController');
const authMiddleware = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/query', authMiddleware, aiLimiter, ragController.askQuestion);

module.exports = router;
