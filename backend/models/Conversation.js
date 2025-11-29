import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true,
        enum: ['user', 'ai'],
    },
    text: {
        type: String,
        required: [true, 'Message text is required'],
        trim: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const conversationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Conversation title is required'],
            trim: true,
            default: 'New Conversation',
        },
        messages: {
            type: [messageSchema],
            default: [],
        },
        lastActivity: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
conversationSchema.index({ userId: 1, lastActivity: -1 });

// Update lastActivity before saving
conversationSchema.pre('save', function (next) {
    if (this.messages.length > 0) {
        this.lastActivity = this.messages[this.messages.length - 1].timestamp;
    }
    next();
});

// Method to add a message
conversationSchema.methods.addMessage = function (sender, text) {
    this.messages.push({ sender, text, timestamp: new Date() });
    this.lastActivity = new Date();
    return this.save();
};

// Static method to get conversation summary
conversationSchema.statics.getConversationSummary = async function (userId) {
    return this.find({ userId })
        .select('_id title lastActivity')
        .sort({ lastActivity: -1 })
        .lean();
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
