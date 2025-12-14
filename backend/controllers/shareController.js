import SharedConversation from '../models/SharedConversation.js';
import mongoose from 'mongoose';
import crypto from 'crypto';

// In-memory storage for shared conversations when MongoDB is not available
const inMemoryShares = new Map();

/**
 * Generate a short, unique alphanumeric slug (e.g., "x7k9-p2")
 */
const generateSlug = () => {
    const bytes = crypto.randomBytes(6);
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let slug = '';
    for (let i = 0; i < 4; i++) {
        slug += chars[bytes[i] % chars.length];
    }
    slug += '-';
    for (let i = 4; i < 6; i++) {
        slug += chars[bytes[i] % chars.length];
    }
    return slug;
};

/**
 * @desc    Create a shared conversation (save Q&A pair)
 * @route   POST /api/share
 * @access  Private
 */
export const createSharedConversation = async (req, res) => {
    try {
        const { question, answer, conversationId } = req.body;

        // Validate required fields
        if (!question || !answer) {
            return res.status(400).json({
                success: false,
                message: 'Question and answer are required',
            });
        }

        // Get user ID from Firebase auth (uid) or fallback
        const userId = req.user?.uid || req.user?.id || 'anonymous';
        const isMongoConnected = mongoose.connection.readyState === 1;

        let shareId;
        let createdAt = new Date();

        if (isMongoConnected) {
            // Use MongoDB
            const sharedConversation = new SharedConversation({
                question: question.trim(),
                answer: answer.trim(),
                sharedBy: userId,
                originalConversationId: conversationId || null,
            });

            await sharedConversation.save();
            shareId = sharedConversation.shareId;
            createdAt = sharedConversation.createdAt;
        } else {
            // Use in-memory storage
            console.log('📦 Using in-memory storage for share (MongoDB not connected)');
            shareId = generateSlug();

            // Ensure unique shareId
            while (inMemoryShares.has(shareId)) {
                shareId = generateSlug();
            }

            inMemoryShares.set(shareId, {
                shareId,
                question: question.trim(),
                answer: answer.trim(),
                sharedBy: userId,
                originalConversationId: conversationId || null,
                views: 0,
                isActive: true,
                createdAt,
            });
        }

        // Generate the full share URL
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const shareUrl = `${baseUrl}/share/${shareId}`;

        console.log(`✅ Created shared conversation: ${shareId}`);

        res.status(201).json({
            success: true,
            message: 'Conversation shared successfully',
            data: {
                shareId,
                shareUrl,
                createdAt,
            },
        });
    } catch (error) {
        console.error('Create shared conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating shared conversation',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * @desc    Get a shared conversation by ID (public endpoint)
 * @route   GET /api/share/:shareId
 * @access  Public
 */
export const getSharedConversation = async (req, res) => {
    try {
        const { shareId } = req.params;

        // Validate shareId
        if (!shareId) {
            return res.status(400).json({
                success: false,
                message: 'Share ID is required',
            });
        }

        const isMongoConnected = mongoose.connection.readyState === 1;
        let sharedConversation;

        if (isMongoConnected) {
            // Use MongoDB
            sharedConversation = await SharedConversation.findOne({
                shareId,
                isActive: true
            });

            if (sharedConversation) {
                // Increment view count
                sharedConversation.views += 1;
                await sharedConversation.save();
            }
        } else {
            // Use in-memory storage
            sharedConversation = inMemoryShares.get(shareId);
            if (sharedConversation && sharedConversation.isActive) {
                sharedConversation.views += 1;
            } else {
                sharedConversation = null;
            }
        }

        if (!sharedConversation) {
            return res.status(404).json({
                success: false,
                message: 'Shared conversation not found or has been deleted',
            });
        }

        // Check if expired (if expiresAt is set)
        if (sharedConversation.expiresAt && new Date() > sharedConversation.expiresAt) {
            return res.status(410).json({
                success: false,
                message: 'This shared conversation has expired',
            });
        }

        res.status(200).json({
            success: true,
            data: {
                shareId: sharedConversation.shareId,
                question: sharedConversation.question,
                answer: sharedConversation.answer,
                createdAt: sharedConversation.createdAt,
                views: sharedConversation.views,
            },
        });
    } catch (error) {
        console.error('Get shared conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching shared conversation',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * @desc    Delete a shared conversation (deactivate)
 * @route   DELETE /api/share/:shareId
 * @access  Private (owner only)
 */
export const deleteSharedConversation = async (req, res) => {
    try {
        const { shareId } = req.params;
        const userId = req.user?.uid || req.user?.id;

        const isMongoConnected = mongoose.connection.readyState === 1;
        let sharedConversation;

        if (isMongoConnected) {
            sharedConversation = await SharedConversation.findOne({ shareId });
        } else {
            sharedConversation = inMemoryShares.get(shareId);
        }

        if (!sharedConversation) {
            return res.status(404).json({
                success: false,
                message: 'Shared conversation not found',
            });
        }

        // Check ownership if user is set
        if (sharedConversation.sharedBy &&
            sharedConversation.sharedBy !== userId &&
            sharedConversation.sharedBy !== 'anonymous') {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this shared conversation',
            });
        }

        // Soft delete (deactivate)
        if (isMongoConnected) {
            sharedConversation.isActive = false;
            await sharedConversation.save();
        } else {
            sharedConversation.isActive = false;
        }

        console.log(`🗑️ Deactivated shared conversation: ${shareId}`);

        res.status(200).json({
            success: true,
            message: 'Shared conversation deleted successfully',
        });
    } catch (error) {
        console.error('Delete shared conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting shared conversation',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * @desc    Get user's shared conversations
 * @route   GET /api/share/user/:userId
 * @access  Private
 */
export const getUserSharedConversations = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate userId
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required',
            });
        }

        const isMongoConnected = mongoose.connection.readyState === 1;
        let sharedConversations;

        if (isMongoConnected) {
            sharedConversations = await SharedConversation.find({
                sharedBy: userId,
                isActive: true,
            })
                .sort({ createdAt: -1 })
                .limit(50)
                .select('shareId question createdAt views');
        } else {
            // Filter from in-memory storage
            sharedConversations = Array.from(inMemoryShares.values())
                .filter(conv => conv.sharedBy === userId && conv.isActive)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 50);
        }

        res.status(200).json({
            success: true,
            count: sharedConversations.length,
            data: sharedConversations.map((conv) => ({
                shareId: conv.shareId,
                question: conv.question.substring(0, 100) + (conv.question.length > 100 ? '...' : ''),
                createdAt: conv.createdAt,
                views: conv.views,
            })),
        });
    } catch (error) {
        console.error('Get user shared conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching shared conversations',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
