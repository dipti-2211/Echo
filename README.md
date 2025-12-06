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

# Create .env file from example
cp .env.example .env

# Edit .env and add your Groq API key
# Get your key from: https://console.groq.com/keys
\`\`\`

**Backend .env configuration:**
\`\`\`env
OPENAI_API_KEY=gsk_your_groq_api_key_here
PORT=5001
NODE_ENV=development
\`\`\`

### 3. Frontend Setup

\`\`\`bash
cd frontend
npm install

# Create .env file from example
cp .env.example .env

# Edit .env and add your Firebase config
# Get from: Firebase Console > Project Settings
\`\`\`

**Frontend .env configuration:**
\`\`\`env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_API_URL=http://localhost:5001
\`\`\`

### 4. Run the Application

**Terminal 1 - Backend:**
\`\`\`bash
cd backend
npm run dev
# or
node server.js
\`\`\`

**Terminal 2 - Frontend:**
\`\`\`bash
cd frontend
npm run dev
\`\`\`

Open http://localhost:5173 in your browser.

## 🚀 Deployment

### Backend (Render)

1. Create account on [Render](https://render.com)
2. New Web Service → Connect GitHub repo
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add environment variables from `.env.example`
5. Deploy!

### Frontend (Vercel)

1. Create account on [Vercel](https://vercel.com)
2. Import project from GitHub
3. Configure:
   - **Framework:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variables from `.env.example`
5. Update `VITE_API_URL` to your Render backend URL
6. Deploy!

### Post-Deployment

1. Update Firebase Authorized Domains with your Vercel URL
2. Update CORS in `backend/server.js` with production URLs
3. Test login, chat, and conversation memory

## 🔑 Getting API Keys

### Groq API Key (Free)
1. Go to https://console.groq.com
2. Sign up
3. Navigate to API Keys
4. Create new key
5. Copy and add to backend `.env`

### Firebase Config
1. Go to https://console.firebase.google.com
2. Create project (or use existing)
3. Enable Authentication → Google Sign-in
4. Enable Firestore Database
5. Go to Project Settings → Your apps
6. Copy configuration values
7. Add to frontend `.env`

## 📝 Environment Variables

**Never commit `.env` files to git!**

Both backend and frontend have `.env.example` files showing required variables. Copy these and fill in your actual values.

## 🐛 Troubleshooting

**Backend won't start:**
- Check all environment variables are set
- Verify Groq API key is valid
- Check port 5001 is not in use

**Frontend can't connect to backend:**
- Verify `VITE_API_URL` in frontend `.env`
- Check backend is running
- Verify CORS settings in `backend/server.js`

**Firebase auth errors:**
- Verify all Firebase config values in frontend `.env`
- Check Firebase authorized domains include your URL

**Conversation memory not working:**
- Check browser console for errors
- Verify backend logs show "Sending to Groq AI with X previous messages"

## 💰 Cost

- **Groq API:** Free tier (generous limits)
- **Firebase:** Free Spark plan (50K reads/day, 20K writes/day)
- **Vercel:** Free Hobby plan (100GB bandwidth/month)
- **Render:** Free tier (750 hours/month)

**Total: $0/month** for personal/portfolio projects

## 📄 License

MIT

## 👨‍💻 Author

**Dipti**
- GitHub: [@dipti-2211](https://github.com/dipti-2211)
- Project: [Echo](https://github.com/dipti-2211/Echo)

## 🙏 Acknowledgments

- Groq AI for fast LLaMA inference
- Firebase for authentication and database
- React team for the amazing framework

---

⭐ Star this repo if you find it useful!
