const express = require('express');
const { authController } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Public auth endpoints
router.post('/login', (req, res, next) => authController.login(req, res, next));

// Protected auth endpoints
router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next));

module.exports = router;

