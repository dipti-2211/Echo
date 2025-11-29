# AI Chatbot - Production-Ready Application

A complete full-stack AI chatbot application with secure Firebase authentication, clean neutral design, and backend token verification.

## 🎨 Design System

- **Background**: `#09090b` (Rich Black) with animated gradient
- **Cards/Containers**: `#18181b` (Dark Zinc) with glass effect
- **Borders**: `#27272a` (Subtle Grey)
- **Primary Text**: `#fafafa` (White)
- **Secondary Text**: `#a1a1aa` (Muted Grey)
- **Animations**: Smooth fade-in, slide-up, gradient animations

## 🚀 Tech Stack

### Frontend

- React 18 + Vite
- Tailwind CSS
- Firebase SDK (Authentication)
- Axios
- Lucide React (Icons)

### Backend

- Node.js + Express
- Firebase Admin SDK (Token Verification)
- CORS
- Protected API routes

## 📁 Project Structure

```
ai-chatbot/
├── src/
│   ├── components/
│   │   ├── Login.jsx          # Firebase auth UI
│   │   └── Chat.jsx            # Main chat interface
│   ├── App.jsx                 # Auth flow management
│   ├── main.jsx                # Entry point
│   ├── index.css               # Global styles + animations
│   ├── firebaseConfig.js       # Firebase client config
│   └── ...
├── backend/
│   ├── server.js               # Express server
│   ├── firebaseAdmin.js        # Firebase Admin SDK
│   ├── middleware/
│   │   └── verifyToken.js      # Auth middleware
│   └── .env.example
├── tailwind.config.js
├── package.json
└── README.md
```

## 🔧 Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable Authentication:
   - Go to **Authentication** > **Sign-in method**
   - Enable **Google** provider
   - Enable **Email/Password** provider
4. Get Firebase Config:
   - Go to **Project Settings** > **Your apps**
   - Click on Web app (</>) or create new web app
   - Copy the config object
5. Get Service Account (for backend):
   - Go to **Project Settings** > **Service Accounts**
   - Click **Generate new private key**
   - Save as `serviceAccountKey.json` in `backend/` folder
   - **⚠️ Add to `.gitignore` - never commit this file!**

### 2. Frontend Setup

```bash
# Navigate to project root
cd ai-chatbot

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env and add your Firebase credentials
# Get these from Firebase Console > Project Settings > Your apps
nano .env
```

**.env** file should contain:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5001
```

### 3. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env
nano .env
```

**backend/.env** file should contain:

```env
NODE_ENV=development
PORT=5001
CORS_ORIGIN=http://localhost:5174
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

**⚠️ Important**: Place your `serviceAccountKey.json` in the `backend/` folder

### 4. Run the Application

**Terminal 1 - Backend:**

```bash
cd backend
npm start
# Server runs on http://localhost:5001
```

**Terminal 2 - Frontend:**

```bash
cd ai-chatbot
npm run dev
# App runs on http://localhost:5174
```

## 🔐 Authentication Flow

1. **User Sign In**: Google OAuth or Email/Password
2. **Token Generation**: Firebase generates ID token
3. **API Requests**: Frontend sends token in `Authorization: Bearer <token>` header
4. **Backend Verification**: Middleware verifies token with Firebase Admin SDK
5. **Protected Routes**: Only valid tokens can access `/api/chat`

## 🛡️ Security Features

✅ Firebase ID token verification on backend  
✅ Protected API routes with middleware  
✅ CORS configuration  
✅ Token expiration handling  
✅ Error handling and validation  
✅ Secure service account storage

## 📡 API Endpoints

### `GET /api/health`

Health check endpoint (unprotected)

**Response:**

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-29T..."
}
```

### `POST /api/chat` 🔒

Protected chat endpoint (requires Firebase token)

**Headers:**

```
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

**Request:**

```json
{
  "message": "Hello, AI!"
}
```

**Response:**

```json
{
  "success": true,
  "response": "That's an interesting perspective...",
  "user": {
    "uid": "user_id",
    "email": "user@example.com"
  },
  "metadata": {
    "processed_at": "11/29/2025, 2:30:45 PM",
    "message_length": 10,
    "response_type": "mock_ai"
  }
}
```

### `POST /api/echo`

Test endpoint (unprotected) - for debugging

## 🎯 Features

### Authentication

- ✅ Google Sign-In (popup)
- ✅ Email/Password Sign-In
- ✅ Email/Password Sign-Up
- ✅ Persistent sessions
- ✅ Sign out functionality

### Chat Interface

- ✅ Real-time message display
- ✅ User and AI message bubbles
- ✅ Typing indicator
- ✅ Auto-scroll to bottom
- ✅ Starter prompt suggestions
- ✅ Loading states
- ✅ Error handling
- ✅ Timestamps
- ✅ Enter to send, Shift+Enter for new line

### Design & UX

- ✅ Animated gradient background
- ✅ Smooth fade-in animations
- ✅ Glass morphism effects
- ✅ Custom scrollbar
- ✅ Responsive layout
- ✅ Clean, neutral color scheme
- ✅ Loading states and indicators

## 🔨 Customization

### Adding Real AI Integration

Replace the mock AI service in `backend/server.js`:

```javascript
// Import OpenAI or other AI SDK
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Replace mockAIService with:
const aiService = async (message) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: message }],
  });

  return {
    message: response.choices[0].message.content,
    metadata: {
      /* ... */
    },
  };
};
```

### Customizing Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  richBlack: '#your-color',
  darkZinc: '#your-color',
  // ... etc
}
```

### Adding Features

- **Message History**: Integrate Firestore to store conversations
- **User Profiles**: Add Firebase user profile management
- **File Uploads**: Add file attachment support
- **Voice Input**: Integrate Web Speech API
- **Markdown Support**: Add markdown rendering for AI responses

## 🐛 Troubleshooting

### "Unauthorized: No token provided"

- Ensure user is logged in
- Check if token is being sent in Authorization header
- Verify Firebase config is correct

### "Firebase Admin not initialized"

- Check if `serviceAccountKey.json` exists in backend folder
- Verify `FIREBASE_SERVICE_ACCOUNT_PATH` in backend `.env`
- Check file permissions

### CORS errors

- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
- Check if backend is running
- Clear browser cache

### Port already in use

```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Kill process on port 5174
lsof -ti:5174 | xargs kill -9
```

## 📦 Dependencies

### Frontend

```json
{
  "firebase": "^12.6.0",
  "lucide-react": "^0.555.0",
  "axios": "^1.7.7",
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
}
```

### Backend

```json
{
  "express": "^4.19.2",
  "firebase-admin": "^12.6.0",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5"
}
```

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Need Help?** Check the Firebase documentation or create an issue in the repository.
