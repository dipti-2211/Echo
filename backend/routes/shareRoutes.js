import express from 'express';
import {
    createSharedConversation,
    getSharedConversation,
    deleteSharedConversation,
    getUserSharedConversations,
} from '../controllers/shareController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// @route   POST /api/share
// @desc    Create a shared conversation
// @access  Private (requires Firebase auth)
router.post('/', verifyToken, createSharedConversation);

// @route   GET /api/share/:shareId
// @desc    Get a shared conversation by ID
// @access  Public (anyone can view shared conversations)
router.get('/:shareId', getSharedConversation);

// @route   DELETE /api/share/:shareId
// @desc    Delete (deactivate) a shared conversation
// @access  Private (owner only)
router.delete('/:shareId', verifyToken, deleteSharedConversation);

// @route   GET /api/share/user/:userId
// @desc    Get all shared conversations for a user
// @access  Private
router.get('/user/:userId', verifyToken, getUserSharedConversations);

export default router;
