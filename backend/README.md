# AI Chatbot Backend API

A robust Node.js and Express backend for the AI Chatbot application with MongoDB and OpenAI integration.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **OpenAI API** - AI responses
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variables

## Features

- ✅ **Auto-signup**: Automatically creates user accounts on first login
- ✅ **JWT Authentication**: Secure token-based authentication
- ✅ **Conversation Management**: Store and retrieve chat history
- ✅ **OpenAI Integration**: Real-time AI responses
- ✅ **Error Handling**: Comprehensive error handling with try/catch
- ✅ **Security**: Protected routes with JWT middleware
- ✅ **MongoDB Integration**: Efficient data storage with Mongoose

## Installation

1. **Install Dependencies**

```bash
cd backend
npm install
```

2. **Configure Environment Variables**

Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ai-chatbot

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7
```

3. **Start MongoDB**

Make sure MongoDB is running on your system:

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

4. **Run the Server**

Development mode (with auto-restart):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Endpoints

### Authentication

#### POST `/api/auth/login`

Login or register a user (auto-signup if user doesn't exist)

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "googleId": "optional_google_id"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-11-27T00:00:00.000Z"
  }
}
```

#### GET `/api/auth/verify`

Verify JWT token and get user info (Protected)

**Headers:**

```
Authorization: Bearer your_jwt_token
```

### Chat & Conversations

#### GET `/api/history/:userId`

Fetch conversation history for a user (Protected)

**Response:**

```json
{
  "success": true,
  "count": 5,
  "conversations": [
    {
      "id": "conversation_id",
      "title": "Previous Code Help",
      "lastActivity": "2025-11-27T00:00:00.000Z"
    }
  ]
}
```

#### GET `/api/conversation/:conversationId`

Get full conversation with all messages (Protected)

**Response:**

```json
{
  "success": true,
  "conversation": {
    "id": "conversation_id",
    "title": "Marketing Plan",
    "messages": [
      {
        "sender": "user",
        "text": "Help me create a marketing plan",
        "timestamp": "2025-11-27T00:00:00.000Z"
      },
      {
        "sender": "ai",
        "text": "I'd be happy to help...",
        "timestamp": "2025-11-27T00:00:01.000Z"
      }
    ],
    "lastActivity": "2025-11-27T00:00:01.000Z"
  }
}
```

#### POST `/api/chat`

Send a message and get AI response (Protected)

**Request Body:**

```json
{
  "userId": "user_id",
  "message": "What is React?",
  "conversationId": "optional_conversation_id"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "conversationId": "conversation_id",
  "response": "React is a JavaScript library...",
  "conversation": {
    "id": "conversation_id",
    "title": "What is React?",
    "messageCount": 2
  }
}
```

#### DELETE `/api/conversation/:conversationId`

Delete a conversation (Protected)

**Request Body:**

```json
{
  "userId": "user_id"
}
```

## Database Models

### User Schema

```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, validated),
  googleId: String (unique, optional),
  createdAt: Date (auto-generated),
  timestamps: true
}
```

### Conversation Schema

```javascript
{
  userId: ObjectId (ref: 'User', required),
  title: String (required, default: 'New Conversation'),
  messages: [{
    sender: String (enum: ['user', 'ai']),
    text: String (required),
    timestamp: Date (auto-generated)
  }],
  lastActivity: Date (auto-updated),
  timestamps: true
}
```

## Project Structure

```
backend/
├── config/
│   └── database.js           # MongoDB connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   └── chatController.js     # Chat & conversation logic
├── middleware/
│   ├── authMiddleware.js     # JWT verification
│   └── errorMiddleware.js    # Error handling
├── models/
│   ├── User.js              # User schema
│   └── Conversation.js      # Conversation schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   └── chatRoutes.js        # Chat endpoints
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
├── server.js               # Main server file
└── README.md               # This file
```

## Security Features

- **JWT Authentication**: All protected routes require valid JWT tokens
- **Password Hashing**: Ready for bcrypt integration if needed
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Comprehensive try/catch blocks
- **CORS Protection**: Configurable origin restrictions
- **Environment Variables**: Sensitive data in .env files

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Testing

Test the API health:

```bash
curl http://localhost:5000/api/health
```

## Production Deployment

1. Set `NODE_ENV=production` in .env
2. Use a secure `JWT_SECRET`
3. Configure MongoDB Atlas or production database
4. Set up proper CORS origins
5. Use process manager (PM2) for production
6. Enable HTTPS
7. Set up monitoring and logging

## Dependencies

```json
{
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5",
  "express": "^4.19.2",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.7.1",
  "openai": "^4.67.3"
}
```

## License

MIT
