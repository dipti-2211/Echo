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
├── backend/
│   ├── controllers/
│   │   └── chatController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── verifyToken.js
│   ├── models/
│   │   ├── Conversation.js
│   │   └── User.js
│   ├── routes/
│   │   └── chatRoutes.js
│   ├── server.js
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.jsx
│   │   │   ├── ChatHistory.jsx
│   │   │   ├── CodeBlock.jsx
│   │   │   ├── LogoutModal.jsx
│   │   │   ├── PersonaSelector.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ThinkingIndicator.jsx
│   │   │   └── TypewriterText.jsx
│   │   ├── firebase.js
│   │   ├── firebaseConfig.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── .gitignore
└── README.md
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
