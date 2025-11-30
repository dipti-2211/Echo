import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAyHp_bOZcd984nb1WTbCmOUFwjXJ8AwEY",
    authDomain: "ai-chatbot-8db80.firebaseapp.com",
    projectId: "ai-chatbot-8db80",
    storageBucket: "ai-chatbot-8db80.firebasestorage.app",
    messagingSenderId: "253211388264",
    appId: "1:253211388264:web:df6790ad0756085a0b8edd",
    measurementId: "G-QZ84JFDYVP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('✅ Firebase initialized with Firestore');

export { auth, db };
export default app;
