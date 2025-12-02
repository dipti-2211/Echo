import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBKO4AKVAOLvua6k4qKxqINxx_6-bW5hxU",
    authDomain: "echo-bots.firebaseapp.com",
    projectId: "echo-bots",
    storageBucket: "echo-bots.firebasestorage.app",
    messagingSenderId: "1005559637510",
    appId: "1:1005559637510:web:3101f61f24b93c95060587",
    measurementId: "G-2NFWSHNKDP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Initialize Firestore with settings to fix offline cache issues
const db = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    experimentalForceLongPolling: true, // Helps with Promise resolution
});

console.log('✅ Firebase initialized with Firestore (long polling enabled)');

export { auth, db };
export default app;
