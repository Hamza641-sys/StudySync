const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const generalLimiter = rateLimit({
  windowMs: config.SECURITY.rateLimitWindowMs,
  max: config.SECURITY.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again in 15 minutes.'
  }
});

const aiLimiter = rateLimit({
  windowMs: config.SECURITY.rateLimitWindowMs,
  max: config.SECURITY.aiRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'AI request limit reached for this session. Please wait before issuing new AI queries to conserve resources.'
  }
});

module.exports = {
  generalLimiter,
  aiLimiter
};
