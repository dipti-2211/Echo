import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';

// Firebase configuration from environment variables
// In development, create a .env file with these values
// In production, set these in your hosting provider's environment settings
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required config
const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);
if (missingKeys.length > 0) {
    console.error('❌ Missing Firebase config:', missingKeys.join(', '));
    console.error('Please create a .env file with VITE_FIREBASE_* variables');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Only initialize analytics in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
    try {
        analytics = getAnalytics(app);
    } catch (e) {
        // Analytics may fail in some environments
    }
}

const auth = getAuth(app);

// Initialize Firestore with settings to fix offline cache issues
const db = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    experimentalForceLongPolling: true,
});

if (import.meta.env.DEV) {
    console.log('✅ Firebase initialized');
}

export { auth, db, analytics };
export default app;
