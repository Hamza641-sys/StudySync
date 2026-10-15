const config = require('../config/env');
const { isFirebaseActive } = require('../config/firebase');

const healthController = {
  check(req, res) {
    res.json({
      status: 'healthy',
      service: 'StudySync Pro Backend API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: config.NODE_ENV,
      features: {
        firebaseActive: isFirebaseActive(),
        openaiConfigured: Boolean(config.OPENAI_API_KEY),
        ragPipeline: 'active',
        rateLimiting: 'active'
      }
    });
  }
};

module.exports = healthController;
