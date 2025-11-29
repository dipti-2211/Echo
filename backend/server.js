import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyToken } from './middleware/verifyToken.js';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize Groq client
let groqClient = null;
if (process.env.GROQ_API_KEY) {
    groqClient = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1'
    });
    console.log('✅ Groq AI initialized');
} else {
    console.log('⚠️  No Groq API key found, using mock responses');
}

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
    credentials: true
}));
app.use(express.json());

// Request logging
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Mock AI Service - Simulates AI response with intelligent logic
const mockAIService = async (message) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const lowerMsg = message.toLowerCase().trim();
    let response;

    // Math calculations
    if (lowerMsg.match(/^\d+\s*[\+\-\*\/]\s*\d+$/)) {
        try {
            const result = eval(lowerMsg);
            response = `The answer is: ${result}`;
        } catch (e) {
            response = `I calculated that for you: ${lowerMsg} = ${eval(lowerMsg)}`;
        }
    }
    // Greetings
    else if (lowerMsg.match(/^(hi|hello|hey|greetings)/)) {
        const greetings = [
            "Hello! How can I help you today?",
            "Hi there! What would you like to know?",
            "Hey! I'm here to assist you. What's on your mind?",
            "Greetings! How may I assist you?"
        ];
        response = greetings[Math.floor(Math.random() * greetings.length)];
    }
    // What/Who/How questions
    else if (lowerMsg.startsWith('what') || lowerMsg.startsWith('who') || lowerMsg.startsWith('how')) {
        response = `That's a great question about "${message}". While I'm a demonstration chatbot, in a real implementation, I would provide detailed information by querying a knowledge base or using an AI model like GPT-4. For now, I'm showing you how the chat interface works!`;
    }
    // Tell me about
    else if (lowerMsg.includes('tell me about') || lowerMsg.includes('explain')) {
        const topic = message.split(/tell me about|explain/i)[1]?.trim() || 'that topic';
        response = `I'd love to explain ${topic}! In a production version with real AI (like OpenAI's GPT or Groq), I would provide a comprehensive explanation. This is a demo showing the chat flow and user experience.`;
    }
    // Help request
    else if (lowerMsg.includes('help') || lowerMsg === '?') {
        response = `I'm here to help! This is a demonstration chatbot. Try asking me:
• Math questions (e.g., "2+2" or "15*7")
• Greetings (e.g., "Hello")
• General questions (e.g., "What is AI?")

In production, this would be connected to a real AI like GPT-4, Claude, or Groq for intelligent responses!`;
    }
    // Code questions
    else if (lowerMsg.includes('code') || lowerMsg.includes('programming') || lowerMsg.includes('javascript')) {
        response = `Great question about coding! In a production environment, I would provide code examples, explanations, and best practices. This demo shows the chat interface - connect to OpenAI, Claude, or Groq API to get real coding assistance!`;
    }
    // Default intelligent response
    else {
        const intelligentResponses = [
            `Interesting point about "${message}". In a real-world scenario with AI integration (OpenAI, Groq, etc.), I would provide a detailed, context-aware response analyzing your question from multiple angles.`,
            `I understand you're interested in "${message}". This demo showcases the chat UI and backend flow. Connect to a real AI API to get intelligent, nuanced responses to questions like this!`,
            `"${message}" - that's worth exploring! Right now I'm running in demo mode. Integrate with GPT-4, Claude, or Groq to get thoughtful, accurate answers to queries like yours.`,
            `You mentioned "${message}". This chat interface is ready for production - just add your AI API key (OpenAI/Groq) to get real intelligent responses instead of these demo messages!`
        ];
        response = intelligentResponses[Math.floor(Math.random() * intelligentResponses.length)];
    }

    const timestamp = new Date().toLocaleString();

    return {
        message: response,
        metadata: {
            processed_at: timestamp,
            message_length: message.length,
            response_type: 'intelligent_mock'
        }
    };
};

// Real Groq AI Service
const groqAIService = async (message) => {
    try {
        const completion = await groqClient.chat.completions.create({
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful, intelligent AI assistant. Provide clear, accurate, and concise responses. Be friendly and professional.'
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            max_tokens: parseInt(process.env.GROQ_MAX_TOKENS) || 2000,
            temperature: parseFloat(process.env.GROQ_TEMPERATURE) || 0.7
        });

        return {
            message: completion.choices[0].message.content,
            metadata: {
                processed_at: new Date().toLocaleString(),
                message_length: message.length,
                response_type: 'groq_ai',
                model: completion.model,
                tokens_used: completion.usage?.total_tokens
            }
        };
    } catch (error) {
        console.error('Groq API error:', error);
        throw error;
    }
};

// Protected Chat Route - Requires valid Firebase token
app.post('/api/chat', verifyToken, async (req, res) => {
    try {
        const { message } = req.body;

        // Validate message
        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid message format'
            });
        }

        console.log(`Processing message from user ${req.user.email}: "${message.substring(0, 50)}..."`);

        // Use real AI if available, otherwise fallback to mock
        let aiResponse;
        if (groqClient) {
            aiResponse = await groqAIService(message.trim());
        } else {
            aiResponse = await mockAIService(message.trim());
        }

        res.json({
            success: true,
            response: aiResponse.message,
            user: {
                uid: req.user.uid,
                email: req.user.email
            },
            metadata: aiResponse.metadata
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing your message',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Test route (unprotected) - for testing server connectivity
app.post('/api/echo', (req, res) => {
    res.json({
        success: true,
        message: 'Echo response',
        received: req.body
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🔒 Protected routes require Firebase auth token`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
