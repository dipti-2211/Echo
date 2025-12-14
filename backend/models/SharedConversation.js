import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * Generate a short, unique alphanumeric slug (e.g., "x7k9-p2")
 * @returns {string} Short unique ID
 */
const generateSlug = () => {
    // Generate 6 random bytes and convert to base62 (alphanumeric)
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

    return slug; // Format: xxxx-xx (e.g., "x7k9-p2")
};

const sharedConversationSchema = new mongoose.Schema(
    {
        // Unique short ID for URL (e.g., x7k9-p2)
        shareId: {
            type: String,
            required: true,
            unique: true,
            default: generateSlug,
        },
        // The user who shared this (Firebase UID - stored as string)
        sharedBy: {
            type: String,
            required: false,
        },
        // The user's question
        question: {
            type: String,
            required: [true, 'Question is required'],
            trim: true,
        },
        // The AI's answer
        answer: {
            type: String,
            required: [true, 'Answer is required'],
            trim: true,
        },
        // Original conversation ID (for reference)
        originalConversationId: {
            type: String,
            required: false,
        },
        // View count for analytics
        views: {
            type: Number,
            default: 0,
        },
        // Whether this share is active
        isActive: {
            type: Boolean,
            default: true,
        },
        // Optional expiration date
        expiresAt: {
            type: Date,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster lookups (shareId index is already created by unique: true)
sharedConversationSchema.index({ sharedBy: 1, createdAt: -1 });

// Static method to find by shareId
sharedConversationSchema.statics.findByShareId = async function (shareId) {
    return this.findOne({ shareId, isActive: true });
};

// Method to increment view count
sharedConversationSchema.methods.incrementViews = async function () {
    this.views += 1;
    return this.save();
};

// Pre-save middleware to ensure unique shareId
sharedConversationSchema.pre('save', async function (next) {
    if (this.isNew && !this.shareId) {
        // Generate unique shareId
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {
            this.shareId = generateSlug();
            const existing = await this.constructor.findOne({ shareId: this.shareId });
            if (!existing) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            return next(new Error('Failed to generate unique share ID'));
        }
    }
    next();
});

const SharedConversation = mongoose.model('SharedConversation', sharedConversationSchema);

export default SharedConversation;
export { generateSlug };
