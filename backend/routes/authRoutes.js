import express from 'express';
import { loginUser, verifyToken } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login or register user (auto-signup)
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/auth/verify
// @desc    Verify JWT token and get user info
// @access  Private
router.get('/verify', protect, verifyToken);

export default router;
