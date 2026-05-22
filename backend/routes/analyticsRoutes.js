const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

// Log metric is accessible either anonymously or authenticated, but will map user if token exists
router.post('/log', (req, res, next) => {
  // If authorization header exists, verify it, otherwise pass through
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    authMiddleware(req, res, next);
  } else {
    next();
  }
}, analyticsController.logMetric);

// User-specific queries require full JWT auth
router.get('/metrics', authMiddleware, analyticsController.getMetrics);
router.get('/ai-advice', authMiddleware, analyticsController.getAiAdvice);

module.exports = router;
