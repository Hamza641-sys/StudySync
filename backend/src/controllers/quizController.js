const { v4: uuidv4 } = require('uuid');
const dbService = require('../services/dbService');
const aiService = require('../services/aiService');

const quizController = {
  async generateQuiz(req, res, next) {
    try {
      const { topic, documentId, count = 5 } = req.body;

      let content = '';
      let quizTopic = topic || 'General Academic Quiz';

      if (documentId) {
        const doc = await dbService.getDocumentById(req.user.id, documentId);
        if (!doc) {
          return res.status(404).json({ success: false, error: 'Selected document not found.' });
        }
        quizTopic = doc.title;
        const chunks = await dbService.getChunksByUser(req.user.id, documentId);
        content = chunks.slice(0, 6).map(c => c.content).join('\n\n');
      }

      const generated = await aiService.generateQuiz({
        text: content,
        topic: quizTopic,
        count: parseInt(count, 10) || 5
      });

      const quizId = `qz_${uuidv4().slice(0, 10)}`;
      const quizRecord = {
        id: quizId,
        topic: quizTopic,
        documentId: documentId || null,
        totalQuestions: generated.questions.length,
        questions: generated.questions, // contains answers on backend
        createdAt: new Date().toISOString()
      };

      // Save complete quiz in db
      await dbService.saveQuiz(req.user.id, quizRecord);

      // Return questions to frontend WITHOUT correctIndex or explanation to prevent cheating before submission!
      const sanitizedQuestions = generated.questions.map((q, idx) => ({
        id: q.id || `q_${idx}`,
        question: q.question,
        options: q.options
      }));

      res.status(201).json({
        success: true,
        quiz: {
          id: quizId,
          topic: quizTopic,
          documentId: documentId || null,
          totalQuestions: sanitizedQuestions.length,
          questions: sanitizedQuestions
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async submitQuiz(req, res, next) {
    try {
      const { quizId, answers } = req.body; // answers: { [questionId or index]: selectedOptionIndex }

      if (!quizId || !answers) {
        return res.status(400).json({ success: false, error: 'Quiz ID and answers payload are required.' });
      }

      const quiz = await dbService.getQuizById(req.user.id, quizId);
      if (!quiz) {
        return res.status(404).json({ success: false, error: 'Quiz not found or unauthorized.' });
      }

      let correctCount = 0;
      const review = quiz.questions.map((q, idx) => {
        const key = q.id || idx;
        const studentChoice = answers[key] !== undefined ? answers[key] : answers[idx];
        const isCorrect = studentChoice === q.correctIndex;
        if (isCorrect) correctCount++;

        return {
          questionId: q.id || `q_${idx}`,
          question: q.question,
          options: q.options,
          studentChoice: studentChoice !== undefined ? studentChoice : null,
          correctIndex: q.correctIndex,
          isCorrect,
          explanation: q.explanation || 'Based on the primary source concepts.'
        };
      });

      const total = quiz.questions.length;
      const scorePercentage = Math.round((correctCount / total) * 100);

      const attemptResult = {
        quizId,
        topic: quiz.topic,
        totalQuestions: total,
        correctCount,
        scorePercentage,
        review,
        submittedAt: new Date().toISOString()
      };

      // Update quiz record with attempt
      quiz.lastAttempt = attemptResult;
      quiz.score = scorePercentage;
      await dbService.saveQuiz(req.user.id, quiz);

      res.json({
        success: true,
        result: attemptResult
      });
    } catch (err) {
      next(err);
    }
  },

  async getHistory(req, res, next) {
    try {
      const quizzes = await dbService.getQuizzes(req.user.id);
      const history = (quizzes || []).map(q => ({
        id: q.id,
        topic: q.topic,
        totalQuestions: q.totalQuestions,
        score: q.score !== undefined ? q.score : (q.lastAttempt ? q.lastAttempt.scorePercentage : null),
        createdAt: q.createdAt,
        submittedAt: q.lastAttempt?.submittedAt || null
      }));

      res.json({
        success: true,
        history
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = quizController;
