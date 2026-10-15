const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/questions', authMiddleware, evaluationController.getQuestions);
router.post('/benchmark', authMiddleware, evaluationController.runBenchmark);

module.exports = router;
