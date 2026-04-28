
const express               = require('express');
const router                = express.Router();
const { login,
        changePassword,
        getMe }             = require('../controllers/auth.controller');
const { authenticate }      = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', login);

// GET  /api/auth/me  (protected)
router.get('/me', authenticate, getMe);

// PUT  /api/auth/change-password  (protected)
router.put('/change-password', authenticate, changePassword);

module.exports = router;