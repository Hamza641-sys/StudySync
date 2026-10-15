const express = require('express');
const router = express.Router();
const summaryController = require('../controllers/summaryController');
const authMiddleware = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/generate', authMiddleware, aiLimiter, summaryController.generateSummary);
router.get('/', authMiddleware, summaryController.getSummaries);

module.exports = router;
