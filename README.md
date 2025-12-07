# 🚀 Echo - AI Chatbot

**Where your thoughts echo through intelligence**

An intelligent AI chatbot built with React, Firebase, and Groq AI, featuring conversation memory and multiple AI personas.

## ✨ Features

- 🤖 **Conversation Memory** - AI remembers context across messages
- 🎭 **Multiple Personas** - Assistant, Senior Developer, Debugger, Creative Writer
- 🔐 **Firebase Authentication** - Secure user login/signup
- 💾 **Chat History** - Save and resume conversations
- 📱 **Responsive Design** - Works on desktop and mobile
- ⚡ **Real-time Responses** - Fast AI-powered replies using Groq

## 🛠️ Tech Stack

**Frontend:**

- React + Vite
- Tailwind CSS
- Firebase Authentication
- Axios for API calls

**Backend:**

- Node.js + Express
- Groq AI API (LLaMA 3.3)
- Firebase Admin SDK
- Rate limiting & Security headers

## 🔒 Security Features

- ✅ Firebase Authentication
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ Environment variable protection

## 📁 Project Structure

```
Echo/
├── backend/                    # Node.js/Express backend
│   ├── controllers/           # Request handlers
│   │   └── chatController.js # Chat logic & AI integration
│   ├── middleware/            # Custom middleware
│   │   ├── authMiddleware.js # Firebase auth verification
│   │   └── verifyToken.js    # Token validation
│   ├── models/               # Database models (if using MongoDB)
│   │   ├── Conversation.js
│   │   └── User.js
│   ├── routes/               # API routes
│   │   └── chatRoutes.js
│   ├── .env                  # Environment variables (not in git)
│   ├── .env.example          # Example env file
│   ├── server.js             # Main server file
│   ├── package.json
│   └── README.md
│
├── frontend/                  # React frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Chat.jsx              # Main chat interface
│   │   │   ├── ChatHistory.jsx       # Sidebar with chat list
│   │   │   ├── CodeBlock.jsx         # Code syntax highlighting
│   │   │   ├── LogoutModal.jsx       # Logout confirmation
│   │   │   ├── PersonaSelector.jsx   # AI mode selector
│   │   │   ├── Sidebar.jsx           # User info sidebar
│   │   │   ├── ThinkingIndicator.jsx # Loading animation
│   │   │   └── TypewriterText.jsx    # Typewriter effect
│   │   ├── firebase.js       # Firebase initialization
│   │   ├── firebaseConfig.js # Firebase config
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # App entry point
│   │   └── index.css         # Global styles
│   ├── .env                  # Environment variables (not in git)
│   ├── .env.example          # Example env file
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js        # Vite configuration
│   └── tailwind.config.js    # Tailwind CSS config
│
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- Groq API key

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/dipti-2211/Echo.git
cd Echo
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend
npm install



## 📄 License

MIT

## 👨‍💻 Author

**Dipti**

- GitHub: [@dipti-2211](https://github.com/dipti-2211)
- Project: [Echo](https://github.com/dipti-2211/Echo)



⭐ Star this repo if you find it useful!
