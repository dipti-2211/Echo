import OpenAI from 'openai';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

// In-memory storage for conversations when MongoDB is not available
const inMemoryConversations = new Map();
let conversationIdCounter = 1;

// Initialize AI client (supports both OpenAI and Groq)
let openai = null;
console.log('Initializing AI client, API key present:', !!process.env.OPENAI_API_KEY);
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    // Check if it's a Groq API key (starts with 'gsk_')
    const isGroqKey = process.env.OPENAI_API_KEY.startsWith('gsk_');

    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: isGroqKey ? 'https://api.groq.com/openai/v1' : undefined,
    });

    console.log(`AI client initialized with ${isGroqKey ? 'Groq' : 'OpenAI'} API`);
} else {
    console.log('AI client not initialized - API key missing or placeholder');
}

/**
 * @desc    Get conversation history for a user
 * @route   GET /api/history/:userId
 * @access  Private
 */
export const getConversationHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate userId
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required',
            });
        }

        // Verify user exists
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Get conversation summaries (ID and title only)
        const conversations = await Conversation.getConversationSummary(userId);

        res.status(200).json({
            success: true,
            count: conversations.length,
            conversations: conversations.map((conv) => ({
                id: conv._id,
                title: conv.title,
                lastActivity: conv.lastActivity,
            })),
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching conversation history',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * @desc    Get full conversation by ID
 * @route   GET /api/conversation/:conversationId
 * @access  Private
 */
export const getConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found',
            });
        }

        res.status(200).json({
            success: true,
            conversation: {
                id: conversation._id,
                title: conversation.title,
                messages: conversation.messages,
                lastActivity: conversation.lastActivity,
            },
        });
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching conversation',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * @desc    Send message and get AI response
 * @route   POST /api/chat
 * @access  Private
 */
export const sendMessage = async (req, res) => {
    try {
        const { userId, message, conversationId, systemInstruction, conversationHistory } = req.body;

        // Validate required fields
        if (!userId || !message) {
            return res.status(400).json({
                success: false,
                message: 'User ID and message are required',
            });
        }

        const isMongoConnected = mongoose.connection.readyState === 1;
        let conversation;
        let messages = [];

        // Use conversation history from request if provided, otherwise fetch from DB
        if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
            console.log('📜 Using conversation history from request:', conversationHistory.length, 'messages');
            // Add the current user message to the history
            messages = [
                ...conversationHistory,
                { role: 'user', content: message }
            ];
            console.log('📜 Total messages (including current):', messages.length);
        } else if (isMongoConnected) {
            // Use MongoDB
            // Verify user exists
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            // Get or create conversation
            if (conversationId) {
                conversation = await Conversation.findById(conversationId);
                if (!conversation) {
                    return res.status(404).json({
                        success: false,
                        message: 'Conversation not found',
                    });
                }
                // Verify conversation belongs to user
                if (conversation.userId.toString() !== userId) {
                    return res.status(403).json({
                        success: false,
                        message: 'Unauthorized access to conversation',
                    });
                }
            } else {
                // Create new conversation with a title based on first message
                const title = message.length > 50 ? message.substring(0, 47) + '...' : message;
                conversation = await Conversation.create({
                    userId,
                    title,
                    messages: [],
                });
            }

            // Add user message to conversation
            await conversation.addMessage('user', message);

            // Prepare messages for OpenAI API
            messages = conversation.messages.map((msg) => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text,
            }));
        } else {
            // Use in-memory storage
            console.log('Using in-memory storage for chat (MongoDB not connected)');

            // Get or create conversation
            if (conversationId) {
                conversation = inMemoryConversations.get(conversationId);
                if (!conversation) {
                    return res.status(404).json({
                        success: false,
                        message: 'Conversation not found',
                    });
                }
                // Verify conversation belongs to user
                if (conversation.userId !== userId) {
                    return res.status(403).json({
                        success: false,
                        message: 'Unauthorized access to conversation',
                    });
                }
            } else {
                // Create new conversation
                const title = message.length > 50 ? message.substring(0, 47) + '...' : message;
                const newConvId = `conv_${conversationIdCounter++}`;
                conversation = {
                    _id: newConvId,
                    userId,
                    title,
                    messages: [],
                    lastActivity: new Date(),
                };
                inMemoryConversations.set(newConvId, conversation);
            }

            // Add user message to conversation
            conversation.messages.push({
                sender: 'user',
                text: message,
                timestamp: new Date(),
            });
            conversation.lastActivity = new Date();

            // Prepare messages for OpenAI API
            messages = conversation.messages.map((msg) => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text,
            }));
        }

        // Call AI API or use mock response
        let aiResponse;

        if (!openai) {
            // Mock response when AI is not configured
            aiResponse = 'AI service not configured. Please add your API key to the .env file.';
            console.log('Using mock AI response - API key not configured');
        } else {
            try {
                // Determine model based on API key type
                const isGroqKey = process.env.OPENAI_API_KEY.startsWith('gsk_');
                const defaultModel = isGroqKey ? 'llama-3.3-70b-versatile' : 'gpt-3.5-turbo';
                const model = process.env.OPENAI_MODEL || defaultModel;

                console.log('🤖 Sending to AI with', messages.length, 'messages in history');
                console.log('📝 Messages:', JSON.stringify(messages, null, 2));

                const completion = await openai.chat.completions.create({
                    model: model,
                    messages: [
                        {
                            role: 'system',
                            content: systemInstruction || `You are "Echo," an intelligent AI assistant. Your tagline is "Where your thoughts echo through intelligence."

ROLE & BEHAVIOR:
- You have access to the previous conversation history in the messages array.
- Use this history to maintain context, continuity, and avoid asking the user for information they have already provided.
- If the user references "it," "that," or "the previous code," refer to the most relevant item in the conversation history.
- If the topic changes significantly, acknowledge the shift but retain the previous context in case the user switches back.
- Provide clear, accurate, and well-structured responses.
- Be conversational yet professional.

CRITICAL: Always check the conversation history before responding. If a user asks "What is my name?" or "What were we talking about?", review the previous messages to answer accurately.`,
                        },
                        ...messages,
                    ],
                    max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
                    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
                });

                aiResponse = completion.choices[0].message.content;
            } catch (openaiError) {
                console.error('OpenAI API error:', openaiError);

                // Save user message even if OpenAI fails (only for MongoDB)
                if (isMongoConnected) {
                    await conversation.save();
                }

                return res.status(500).json({
                    success: false,
                    message: 'Error generating AI response',
                    error: process.env.NODE_ENV === 'development' ? openaiError.message : undefined,
                    conversationId: conversation._id,
                });
            }
        }

        // Add AI response to conversation
        if (isMongoConnected) {
            await conversation.addMessage('ai', aiResponse);
        } else {
            // In-memory storage
            conversation.messages.push({
                sender: 'ai',
                text: aiResponse,
                timestamp: new Date(),
            });
            conversation.lastActivity = new Date();
        }

        res.status(200).json({
            success: true,
            message: 'Message sent successfully',
            conversationId: conversation._id,
            response: aiResponse,
            conversation: {
                id: conversation._id,
                title: conversation.title,
                messageCount: conversation.messages.length,
            },
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing message',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * @desc    Delete conversation
 * @route   DELETE /api/conversation/:conversationId
 * @access  Private
 */
export const deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { userId } = req.body;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found',
            });
        }

        // Verify conversation belongs to user
        if (conversation.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to delete this conversation',
            });
        }

        await conversation.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Conversation deleted successfully',
        });
    } catch (error) {
        console.error('Delete conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting conversation',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
