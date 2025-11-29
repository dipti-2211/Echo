import express from 'express';
import {
    getConversationHistory,
    getConversation,
    sendMessage,
    deleteConversation,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/history/:userId
// @desc    Get conversation history for a user (ID and title only)
// @access  Private
router.get('/history/:userId', protect, getConversationHistory);

// @route   GET /api/conversation/:conversationId
// @desc    Get full conversation by ID
// @access  Private
router.get('/conversation/:conversationId', protect, getConversation);

// @route   POST /api/chat
// @desc    Send message and get AI response
// @access  Private
router.post('/chat', protect, sendMessage);

// @route   DELETE /api/conversation/:conversationId
// @desc    Delete conversation
// @access  Private
router.delete('/conversation/:conversationId', protect, deleteConversation);

export default router;
