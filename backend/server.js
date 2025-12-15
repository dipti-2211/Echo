import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { verifyToken } from './middleware/verifyToken.js';
import OpenAI from 'openai';
import shareRoutes from './routes/shareRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize Groq client
let groqClient = null;
if (process.env.OPENAI_API_KEY) {
    groqClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_API_KEY.startsWith('gsk_') ? 'https://api.groq.com/openai/v1' : undefined
    });
    console.log('✅ Groq AI initialized');
} else {
    console.log('⚠️  No Groq API key found, using mock responses');
}

// Security: Helmet for security headers
app.use(helmet());

// Security: Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per 15 minutes
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://echo-ai-chat-bot.vercel.app',
    process.env.FRONTEND_URL // For production
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS policy violation'), false);
        }
        return callback(null, true);
    },
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
            response = `## 🔢 Calculation Result\n\nThe answer is: **${result}**\n\n✅ Calculation: \`${lowerMsg} = ${result}\``;
        } catch (e) {
            response = `## ⚠️ Calculation Error\n\nI couldn't process that calculation. Please check your syntax.`;
        }
    }
    // Greetings
    else if (lowerMsg.match(/^(hi|hello|hey|greetings)/)) {
        const greetings = [
            "## 👋 Hello!\n\nHow can I help you today? Feel free to ask me anything!",
            "## 🌟 Hi there!\n\nWhat would you like to know? I'm here to assist you.",
            "## 👋 Hey!\n\nI'm **Echo**, your AI assistant. What's on your mind?",
            "## 🙌 Greetings!\n\nHow may I assist you today?"
        ];
        response = greetings[Math.floor(Math.random() * greetings.length)];
    }
    // What/Who/How questions
    else if (lowerMsg.startsWith('what') || lowerMsg.startsWith('who') || lowerMsg.startsWith('how')) {
        response = `## 💡 Great Question!\n\nYou asked about: **"${message}"**\n\n⚠️ **Demo Mode Active**\n\nCurrently running in demonstration mode. In a production environment with real AI integration (OpenAI, Groq, etc.), I would provide:\n\n• Detailed, comprehensive answers\n• Step-by-step explanations\n• Relevant examples and use cases\n• Links to additional resources\n\nThis demo showcases the chat interface and user experience! 🚀`;
    }
    // Tell me about
    else if (lowerMsg.includes('tell me about') || lowerMsg.includes('explain')) {
        const topic = message.split(/tell me about|explain/i)[1]?.trim() || 'that topic';
        response = `## 📚 Explanation Request\n\n### Topic: ${topic}\n\n⚠️ **Demo Mode**\n\nI'd love to explain **${topic}** in detail! In production with real AI (OpenAI GPT, Groq, Claude):\n\n**What I would provide:**\n• Clear definition and overview\n• Key concepts broken down step-by-step\n• Practical examples and applications\n• Best practices and tips\n\n✨ This is a demo showing the chat flow and visual formatting capabilities!`;
    }
    // Help request
    else if (lowerMsg.includes('help') || lowerMsg === '?') {
        response = `## 🆘 How Can I Help?\n\n**Demo Mode Active** - Try asking me:\n\n### 🔢 Math Questions\n• Simple calculations: \`2+2\` or \`15*7\`\n\n### 👋 Greetings\n• Say hello: \`Hello\`, \`Hi\`, \`Hey\`\n\n### ❓ Questions\n• Ask: \`What is AI?\` or \`How does X work?\`\n\n### 💻 Code Examples\n• Request: \`Show me a JavaScript function\`\n\n---\n\n✨ **In Production:** Connect to OpenAI, Claude, or Groq API for intelligent, context-aware responses with full AI capabilities!`;
    }
    // Code questions
    else if (lowerMsg.includes('code') || lowerMsg.includes('programming') || lowerMsg.includes('javascript')) {
        response = `## 💻 Code Question Detected!\n\n**Demo Mode Active**\n\nIn a production environment, I would provide:\n\n### What You'd Get:\n✅ Complete, runnable code examples\n✅ Line-by-line explanations\n✅ Best practices and optimization tips\n✅ Error handling patterns\n\n### Example Format:\n\`\`\`javascript\n// I would provide properly formatted code here\nfunction example() {\n  return "Like this!";\n}\n\`\`\`\n\n🚀 **Next Step:** Connect to OpenAI, Claude, or Groq API for real coding assistance!`;
    }
    // Default intelligent response
    else {
        const intelligentResponses = [
            `## 🤔 Interesting Question!\n\nYou mentioned: **"${message}"**\n\n⚠️ **Demo Mode Active**\n\nIn a real AI-powered environment:\n\n• I would analyze your question from multiple angles\n• Provide detailed, context-aware responses\n• Include relevant examples and explanations\n• Structure information with clear headings and formatting\n\n✨ **Connect to a real AI API** (OpenAI/Groq) to unlock full intelligent responses!`,
            `## 💭 About: "${message}"\n\n**Demo Chatbot Response**\n\nThis showcases the chat UI and backend flow.\n\n### In Production:\n• Real-time AI-powered answers\n• Context-aware conversations\n• Structured, professional responses\n• Code examples with syntax highlighting\n\n🚀 Add your AI API key to get intelligent responses!`,
            `## 🎯 "${message}"\n\n**Demo Mode** - That's worth exploring!\n\n### What Real AI Would Provide:\n✅ Thoughtful, accurate answers\n✅ Step-by-step explanations\n✅ Relevant examples and use cases\n✅ Professional markdown formatting\n\n💡 Integrate with GPT-4, Claude, or Groq for production-ready responses!`
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
const groqAIService = async (message, conversationHistory = [], temperature = 0.7) => {
    try {
        // Build messages array with history
        const messages = [
            {
                role: 'system',
                content: `You are Echo, an intelligent coding assistant. Explain like Google Gemini - clean, conversational text without unnecessary code blocks.

### FORMATTING RULES (Gemini Style):

Inline Code:
- Use single backticks \` for variable names, function names, or short code within sentences.
- Example: "The \`useState\` hook manages state in React."

Explaining Code:
- Write explanations as PLAIN TEXT.
- Use numbered or bulleted lists naturally in your explanation.
- Example:
  
  Here's how this loop works:
  
  1. The \`for\` keyword initiates the loop
  2. \`int i=0\` initializes a counter variable
  3. \`i<5\` checks if we should continue looping
  4. \`i++\` increments the counter after each iteration

Code Blocks:
- Use \`\`\` ONLY when showing complete, runnable code examples.
- NOT for explanations or breaking down code.
- Always specify language.

Be conversational and clear. Focus on helping the user understand.

CONTEXT AWARENESS:
- Check previous messages in the conversation history.
- Reference earlier discussions when relevant.
- Maintain continuity throughout the conversation.`
            },
            ...conversationHistory,
            {
                role: 'user',
                content: message
            }
        ];

        console.log('🤖 Sending to Groq AI with', conversationHistory.length, 'previous messages');

        const completion = await groqClient.chat.completions.create({
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            messages: messages,
            max_tokens: parseInt(process.env.GROQ_MAX_TOKENS) || 2000,
            temperature: temperature // Use persona-specific temperature
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

// Generate Chat Title Service
const generateChatTitle = async (userMessage) => {
    try {
        if (groqClient) {
            const completion = await groqClient.chat.completions.create({
                model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'Summarize this prompt in 3-5 words for a chat title. Do not use quotes. Be concise and descriptive.'
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                max_tokens: 20,
                temperature: 0.7
            });

            return completion.choices[0].message.content.trim();
        } else {
            // Mock title generation
            const words = userMessage.split(' ').slice(0, 4).join(' ');
            return words.length > 30 ? words.substring(0, 30) + '...' : words;
        }
    } catch (error) {
        console.error('Title generation error:', error);
        return 'New Conversation';
    }
};

// Protected Chat Route - Requires valid Firebase token
app.post('/api/chat', verifyToken, async (req, res) => {
    try {
        const { message, conversationHistory, temperature } = req.body;

        // Validate message
        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid message format'
            });
        }

        console.log(`Processing message from user ${req.user.email}: "${message.substring(0, 50)}..."`);
        console.log('📜 Received conversation history:', conversationHistory ? conversationHistory.length : 0, 'messages');
        console.log('🌡️  Temperature:', temperature || 0.7);

        // Use real AI if available, otherwise fallback to mock
        let aiResponse;
        if (groqClient) {
            aiResponse = await groqAIService(message.trim(), conversationHistory || [], temperature || 0.7);
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

// Generate Chat Title endpoint - Requires valid Firebase token
app.post('/api/generate-title', verifyToken, async (req, res) => {
    try {
        const { message } = req.body;

        // Validate message
        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid message format'
            });
        }

        console.log(`Generating title for: "${message.substring(0, 50)}..."`);

        const title = await generateChatTitle(message.trim());

        res.json({
            success: true,
            title: title
        });

    } catch (error) {
        console.error('Title generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating title',
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

// Share conversation routes
app.use('/api/share', shareRoutes);

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
