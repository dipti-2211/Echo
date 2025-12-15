# 🚀 Pre-Deployment Flight Check

> **Echo AI Chatbot - Production Readiness Checklist**  
> Last Updated: December 2025

Use this checklist before every production deployment. Test each item manually and check it off.

---

## 1. ✅ Critical Functionality (The "Happy Path")

### Environment Variables & API Keys

- [ ] **Verify `.env` files are NOT committed to Git**

  ```bash
  # Run this command - should show .env in the list
  cat .gitignore | grep -E "\.env"
  ```

- [ ] **Check no hardcoded API keys in source code**

  ```bash
  # Search for potential hardcoded keys (should return nothing suspicious)
  grep -r "sk-" --include="*.js" --include="*.jsx" ./frontend/src
  grep -r "gsk_" --include="*.js" ./backend
  ```

- [ ] **Verify all required env vars are set in production**
  - Backend: `OPENAI_API_KEY`, `FIREBASE_*`, `FRONTEND_URL`
  - Frontend: `VITE_API_URL`, `VITE_FIREBASE_*`

### API Error Handling

- [ ] **Test API timeout behavior**

  1. Temporarily set a very low timeout (e.g., 100ms) in Chat.jsx
  2. Send a message
  3. ✓ Verify: Error message appears (not infinite loading)
  4. ✓ Verify: User can retry or send another message

- [ ] **Test network failure**

  1. Open DevTools → Network → Set to "Offline"
  2. Try to send a message
  3. ✓ Verify: Graceful error message appears
  4. ✓ Verify: No console errors crash the app

- [ ] **Test invalid/expired auth token**
  1. Log in, then manually clear Firebase auth from DevTools
  2. Try to send a message
  3. ✓ Verify: User is redirected to login OR shown auth error

### Streaming Response

- [ ] **Test streaming auto-scroll**

  1. Send a prompt that generates a long response (e.g., "Write a 500-word essay about AI")
  2. ✓ Verify: Page auto-scrolls as new tokens arrive
  3. ✓ Verify: User can manually scroll up without being forced back down
  4. ✓ Verify: Stop button appears and works during generation

- [ ] **Test streaming interruption**
  1. Start a long response
  2. Click "Stop" button mid-generation
  3. ✓ Verify: Generation stops immediately
  4. ✓ Verify: Partial response is preserved
  5. ✓ Verify: Can send new message immediately after

### Chat Persistence

- [ ] **Test chat history saves on reload**

  1. Send 2-3 messages in a conversation
  2. Hard refresh the page (Cmd+Shift+R)
  3. ✓ Verify: Same conversation loads with all messages
  4. ✓ Verify: Chat title appears in sidebar

- [ ] **Test chat history across sessions**

  1. Send messages, then log out
  2. Log back in
  3. ✓ Verify: All previous chats appear in sidebar
  4. ✓ Verify: Can open and continue old conversations

- [ ] **Test new chat creation**
  1. Click "New Chat" button
  2. ✓ Verify: Previous messages are cleared
  3. ✓ Verify: Input is focused automatically
  4. ✓ Verify: New chat appears in sidebar after first message

---

## 2. 📱 Mobile & Responsiveness (The "Stress Test")

### Viewport & Keyboard Issues

- [ ] **Test 100vh keyboard overflow (iOS Safari)**

  1. Open on iPhone Safari (or use Xcode Simulator)
  2. Tap the input field to open keyboard
  3. ✓ Verify: Input remains visible above keyboard
  4. ✓ Verify: No content gets cut off or hidden
  5. ✓ Verify: Can scroll to see all messages with keyboard open

- [ ] **Test 100vh keyboard overflow (Android Chrome)**

  1. Open on Android Chrome (or use Android Studio Emulator)
  2. Tap the input field
  3. ✓ Verify: Same checks as iOS above

- [ ] **Test landscape orientation**
  1. Rotate device to landscape
  2. ✓ Verify: Layout doesn't break
  3. ✓ Verify: Can still type and send messages

### Touch Targets

- [ ] **Verify minimum touch target sizes (44x44px)**

  Test these elements with your finger (not mouse):

  - [ ] Send button - Easy to tap?
  - [ ] New chat button - Easy to tap?
  - [ ] Sidebar toggle (hamburger menu) - Easy to tap?
  - [ ] Chat history items - Easy to select?
  - [ ] Persona selector - Easy to tap?
  - [ ] Delete chat button - Easy to tap without accidental taps?
  - [ ] Share button - Easy to tap?
  - [ ] Stop generation button - Easy to tap quickly?

- [ ] **Test button spacing**
  1. Try tapping buttons quickly in succession
  2. ✓ Verify: No accidental taps on adjacent buttons
  3. ✓ Verify: Buttons have adequate spacing

### Text Readability

- [ ] **Test on small screens (iPhone SE / 375px width)**

  1. Open DevTools → Device Mode → iPhone SE
  2. ✓ Verify: All text is readable (minimum 14px for body)
  3. ✓ Verify: No horizontal overflow/scrolling
  4. ✓ Verify: Code blocks have horizontal scroll, not overflow

- [ ] **Test message bubbles**

  1. Send messages of varying lengths
  2. ✓ Verify: Long messages wrap properly
  3. ✓ Verify: Code blocks are readable and scrollable
  4. ✓ Verify: Markdown renders correctly on mobile

- [ ] **Test sidebar on mobile**
  1. Open sidebar on mobile
  2. ✓ Verify: Sidebar overlays content (doesn't push)
  3. ✓ Verify: Can close by tapping outside
  4. ✓ Verify: Chat titles don't overflow

---

## 3. ⚡ Performance & Polish

### Layout Shifts (CLS)

- [ ] **Test initial page load**

  1. Hard refresh the page
  2. Watch for any "jumping" content
  3. ✓ Verify: Logo/header doesn't shift
  4. ✓ Verify: Sidebar doesn't cause content jump

- [ ] **Test chat message loading**

  1. Open an existing conversation with many messages
  2. ✓ Verify: Messages don't cause layout shift as they load
  3. ✓ Verify: Scroll position is maintained

- [ ] **Test AI response rendering**
  1. Send a message and watch the response area
  2. ✓ Verify: No jumping when AI response starts appearing
  3. ✓ Verify: No jumping when code blocks render

### Loading States

- [ ] **Test loading indicators appear immediately**

  For each action, verify loading state appears in < 100ms:

  - [ ] Sending a message → Loading spinner/indicator
  - [ ] Loading chat history → Skeleton or spinner
  - [ ] Initial app load → Loading screen
  - [ ] Switching chats → Loading state

- [ ] **Test "thinking" indicator**
  1. Send a message
  2. ✓ Verify: Thinking indicator appears immediately
  3. ✓ Verify: Indicator is visually clear and animated

### Console Cleanup

- [ ] **Remove debug console.log statements**

  ```bash
  # Find all console.log in frontend (review and remove debug ones)
  grep -rn "console.log" ./frontend/src --include="*.jsx" --include="*.js" | grep -v node_modules

  # Find all console.log in backend
  grep -rn "console.log" ./backend --include="*.js" | grep -v node_modules
  ```

  ✓ Keep: Error logging, important state changes  
  ✗ Remove: Debug logs like "here", "test", variable dumps

- [ ] **Check for console errors in production**

  1. Open DevTools Console
  2. Navigate through entire app
  3. ✓ Verify: No red errors
  4. ✓ Verify: No yellow warnings (or they're acceptable)

- [ ] **Verify logger utility respects environment**
  ```javascript
  // In production, logger should be silent or minimal
  // Check frontend/src/utils/logger.js
  ```

---

## 4. 🔍 SEO & Metadata

### Open Graph Images

- [ ] **Test Twitter Card preview**

  1. Go to: https://cards-dev.twitter.com/validator
  2. Enter your production URL
  3. ✓ Verify: Image appears correctly (1200x630px recommended)
  4. ✓ Verify: Title and description are correct

- [ ] **Test LinkedIn preview**

  1. Go to: https://www.linkedin.com/post-inspector/
  2. Enter your production URL
  3. ✓ Verify: Image, title, description appear correctly

- [ ] **Test Facebook/General OG preview**

  1. Go to: https://developers.facebook.com/tools/debug/
  2. Enter your production URL
  3. ✓ Verify: All OG tags are detected

- [ ] **Verify OG image exists and loads**

  ```bash
  # Check if og-image.png exists
  ls -la ./frontend/public/og-image.png

  # Verify it's accessible at the expected URL
  curl -I https://your-domain.com/og-image.png
  ```

### Title & Meta Descriptions

- [ ] **Check index.html meta tags**

  Open `frontend/index.html` and verify:

  - [ ] `<title>` is descriptive and unique
  - [ ] `<meta name="description">` is 150-160 characters
  - [ ] `og:title` matches or complements `<title>`
  - [ ] `og:description` is compelling for social shares
  - [ ] `og:url` points to production URL
  - [ ] `twitter:card` is set to "summary_large_image"

- [ ] **Test shared conversation pages**
  1. Share a conversation and open the share link
  2. ✓ Verify: Page title updates to conversation topic
  3. ✓ Verify: Meta description is relevant

### Favicon

- [ ] **Verify favicon appears in all browsers**

  - [ ] Chrome - Tab shows favicon?
  - [ ] Safari - Tab shows favicon?
  - [ ] Firefox - Tab shows favicon?

- [ ] **Check favicon files exist**

  ```bash
  ls -la ./frontend/public/favicon*
  # Should see: favicon.ico, favicon.svg, or similar
  ```

- [ ] **Test favicon on mobile (home screen icon)**
  1. Add site to home screen on iOS/Android
  2. ✓ Verify: App icon appears correctly

---

## 5. 🔒 Security & Edge Cases

### Input Sanitization

- [ ] **Test extremely long input**

  1. Paste 10,000+ characters into the input field
  2. ✓ Verify: Input is truncated OR clear error message shown
  3. ✓ Verify: App doesn't crash or freeze
  4. ✓ Verify: No memory issues in DevTools Performance

- [ ] **Test XSS prevention**

  1. Send message: `<script>alert('xss')</script>`
  2. ✓ Verify: Script is NOT executed
  3. ✓ Verify: Text is displayed as plain text or escaped

- [ ] **Test HTML injection**

  1. Send message: `<img src=x onerror=alert('xss')>`
  2. ✓ Verify: No alert appears
  3. ✓ Verify: Rendered safely

- [ ] **Test markdown edge cases**
  1. Send message with nested markdown: `**bold _italic **nested** italic_**`
  2. ✓ Verify: Renders without breaking layout
  3. ✓ Verify: No infinite loops or crashes

### Rate Limiting

- [ ] **Test rapid send button clicking**

  1. Click send button 10 times rapidly
  2. ✓ Verify: Only 1 message is sent (button should disable)
  3. ✓ Verify: No duplicate messages appear

- [ ] **Test backend rate limiting**

  1. Send 20+ messages in quick succession (use a script or rapid clicking)
  2. ✓ Verify: Rate limit kicks in (429 response)
  3. ✓ Verify: User sees friendly "slow down" message

- [ ] **Test rate limit recovery**
  1. Hit the rate limit
  2. Wait for the cooldown period
  3. ✓ Verify: Can send messages again

### Authentication Edge Cases

- [ ] **Test session expiry**

  1. Log in, then wait for token to expire (or manually expire it)
  2. Try to send a message
  3. ✓ Verify: Graceful handling (re-auth or error message)

- [ ] **Test concurrent sessions**

  1. Log in on two different browsers/devices
  2. Send messages from both
  3. ✓ Verify: Both sessions work correctly
  4. ✓ Verify: Chat history syncs between them

- [ ] **Test guest mode limitations**
  1. Continue as Guest
  2. ✓ Verify: Chat works but data may not persist
  3. ✓ Verify: Clear indication of guest mode limitations

---

## 📋 Final Pre-Launch Steps

- [ ] **Run production build locally**

  ```bash
  cd frontend && npm run build && npm run preview
  cd backend && npm start
  ```

  Test the production build works correctly.

- [ ] **Verify environment variables in Vercel**

  - Go to Vercel Dashboard → Project → Settings → Environment Variables
  - Confirm all required variables are set for Production

- [ ] **Test on actual production URL**

  1. Deploy to Vercel
  2. Test the live URL (not localhost)
  3. ✓ Verify: CORS works correctly
  4. ✓ Verify: API calls succeed
  5. ✓ Verify: Firebase auth works

- [ ] **Monitor first 24 hours**
  - Watch Vercel logs for errors
  - Check Firebase Console for auth issues
  - Monitor API usage/costs

---

## 🎉 Launch Confidence Score

Count your checked items:

| Score     | Status                      |
| --------- | --------------------------- |
| 90-100%   | ✅ Ship it!                 |
| 75-89%    | ⚠️ Fix critical items first |
| Below 75% | 🛑 Not ready for production |

---

_Generated for Echo AI Chatbot - Good luck with your launch! 🚀_
