const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/generate', authMiddleware, aiLimiter, quizController.generateQuiz);
router.post('/submit', authMiddleware, quizController.submitQuiz);
router.get('/history', authMiddleware, quizController.getHistory);

module.exports = router;
