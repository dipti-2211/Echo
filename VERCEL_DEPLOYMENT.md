# 🚀 Vercel Deployment Guide

## Prerequisites

- [ ] Git repository pushed to GitHub/GitLab/Bitbucket
- [ ] All `.env` files removed from git (use `.env.example` only)
- [ ] New API keys generated (old ones revoked)

## Step 1: Convert OG Image to PNG

The OG image is currently in SVG format. Convert it to PNG (1200x630px):

### Option A: Online Converter

1. Go to https://svgtopng.com/
2. Upload `frontend/public/og-image.svg`
3. Download as PNG (1200x630)
4. Save as `frontend/public/og-image.png`

### Option B: Using Command Line (ImageMagick)

```bash
cd frontend/public
convert -background none -size 1200x630 og-image.svg og-image.png
```

### Option C: Using Browser

1. Open `og-image.svg` in Chrome
2. Right-click → "Inspect"
3. Take screenshot at 1200x630 resolution
4. Save as `og-image.png`

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Install Vercel CLI (if not installed)

```bash
npm install -g vercel
```

### 2.2 Login to Vercel

```bash
vercel login
```

### 2.3 Navigate to Frontend Directory

```bash
cd /Users/user/Documents/ai-chatbot/frontend
```

### 2.4 Initialize Vercel Project

```bash
vercel
```

Follow prompts:

- **Set up and deploy?** → `Y`
- **Which scope?** → Your account
- **Link to existing project?** → `N`
- **Project name?** → `echo-ai-chatbot`
- **Directory?** → `./` (current directory)
- **Override settings?** → `N`

### 2.5 Set Environment Variables (Frontend)

```bash
# Set each environment variable
vercel env add VITE_FIREBASE_API_KEY production
# Paste: AIzaSyBKO4AKVAOLvua6k4qKxqINxx_6-bW5hxU

vercel env add VITE_FIREBASE_AUTH_DOMAIN production
# Paste: echo-bots.firebaseapp.com

vercel env add VITE_FIREBASE_PROJECT_ID production
# Paste: echo-bots

vercel env add VITE_FIREBASE_STORAGE_BUCKET production
# Paste: echo-bots.firebasestorage.app

vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
# Paste: 1005559637510

vercel env add VITE_FIREBASE_APP_ID production
# Paste: 1:1005559637510:web:3101f61f24b93c95060587

vercel env add VITE_FIREBASE_MEASUREMENT_ID production
# Paste: G-2NFWSHNKDP

vercel env add VITE_API_URL production
# Paste: https://your-backend-url.vercel.app (UPDATE AFTER BACKEND DEPLOY)
```

### 2.6 Deploy to Production

```bash
vercel --prod
```

**Note your frontend URL:** `https://echo-ai-chatbot.vercel.app`

---

## Step 3: Deploy Backend to Vercel

### 3.1 Navigate to Backend Directory

```bash
cd /Users/user/Documents/ai-chatbot/backend
```

### 3.2 Create `vercel.json` Configuration

```bash
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOF
```

### 3.3 Initialize Vercel Project

```bash
vercel
```

Follow prompts:

- **Project name?** → `echo-ai-backend`

### 3.4 Set Environment Variables (Backend)

```bash
# CRITICAL: Use NEW API keys (revoke old ones first!)

vercel env add NODE_ENV production
# Paste: production

vercel env add PORT production
# Paste: 5001

vercel env add JWT_SECRET production
# Generate new: openssl rand -base64 64
# Paste generated secret

vercel env add CORS_ORIGIN production
# Paste: https://echo-ai-chatbot.vercel.app (your frontend URL)

vercel env add OPENAI_API_KEY production
# Paste: YOUR_NEW_GROQ_API_KEY (get from https://console.groq.com)

vercel env add OPENAI_MODEL production
# Paste: llama-3.3-70b-versatile

vercel env add OPENAI_MAX_TOKENS production
# Paste: 2000

vercel env add OPENAI_TEMPERATURE production
# Paste: 0.7

# If using MongoDB Atlas:
vercel env add MONGODB_URI production
# Paste: your MongoDB Atlas connection string
```

### 3.5 Deploy Backend

```bash
vercel --prod
```

**Note your backend URL:** `https://echo-ai-backend.vercel.app`

---

## Step 4: Update Frontend with Backend URL

### 4.1 Update Frontend Environment Variable

```bash
cd /Users/user/Documents/ai-chatbot/frontend
vercel env rm VITE_API_URL production
vercel env add VITE_API_URL production
# Paste: https://echo-ai-backend.vercel.app
```

### 4.2 Redeploy Frontend

```bash
vercel --prod
```

---

## Step 5: Update CORS in Backend

The backend CORS should already be configured via environment variables, but verify:

```bash
cd /Users/user/Documents/ai-chatbot/backend
vercel env ls
```

Ensure `CORS_ORIGIN` matches your frontend URL.

---

## Step 6: Post-Deployment Checklist

### ✅ Frontend Checks

- [ ] Visit `https://echo-ai-chatbot.vercel.app`
- [ ] Login with Firebase works
- [ ] Check browser console for errors
- [ ] Test chat functionality
- [ ] Verify OG image: https://www.opengraph.xyz/

### ✅ Backend Checks

- [ ] Visit `https://echo-ai-backend.vercel.app/api/health`
- [ ] Should return: `{"success": true, "message": "Server is running"}`

### ✅ Security Checks

- [ ] Old API keys revoked
- [ ] `.env` files NOT in git repository
- [ ] Firebase security rules configured
- [ ] CORS only allows your frontend domain

---

## Troubleshooting

### Issue: "CORS Error"

**Fix:** Update backend `CORS_ORIGIN` to match frontend URL exactly

### Issue: "Environment variables not found"

**Fix:** Redeploy after setting env vars: `vercel --prod`

### Issue: "API connection failed"

**Fix:** Check `VITE_API_URL` in frontend matches backend URL

### Issue: "Firebase not connecting"

**Fix:** Verify all Firebase env vars are set correctly

---

## Alternative: Vercel Dashboard Method

If you prefer using the UI:

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend/` (or leave empty if deploying root)
5. Add all environment variables in the dashboard
6. Deploy!

---

## Cost Optimization

Vercel Free Tier includes:

- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Serverless Functions (1000 hours/month)

For production with higher traffic, consider Vercel Pro ($20/month).

---

## Quick Deploy Script

Create this file to automate deployment:

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Deploying Echo AI Chatbot..."

# Deploy backend
cd backend
echo "📦 Deploying backend..."
vercel --prod --yes

# Get backend URL
BACKEND_URL=$(vercel ls --prod | grep backend | awk '{print $2}')

# Deploy frontend
cd ../frontend
echo "📦 Deploying frontend..."
vercel --prod --yes

echo "✅ Deployment complete!"
echo "Frontend: https://echo-ai-chatbot.vercel.app"
echo "Backend: $BACKEND_URL"
```

Make executable: `chmod +x deploy.sh`

---

**Need help?** Check Vercel docs: https://vercel.com/docs
