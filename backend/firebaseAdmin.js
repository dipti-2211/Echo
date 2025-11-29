import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
// For production: Use service account JSON file
// For development: Can use application default credentials or service account

let firebaseAdmin;

try {
    // Option 1: Using service account JSON (recommended for production)
    // Download from: Firebase Console > Project Settings > Service Accounts > Generate new private key
    // Save as serviceAccountKey.json in backend folder and add to .gitignore

    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        const serviceAccount = await import(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
        firebaseAdmin = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount.default)
        });
    } else {
        // Option 2: Using environment variables (alternative)
        // Set these in your .env file
        const serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        };

        if (serviceAccount.projectId && serviceAccount.privateKey && serviceAccount.clientEmail) {
            firebaseAdmin = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
            console.warn('⚠️  Firebase Admin not configured. Token verification will fail.');
            console.warn('   Set FIREBASE_SERVICE_ACCOUNT_PATH or provide credentials in .env');
        }
    }
} catch (error) {
    console.error('Error initializing Firebase Admin:', error.message);
    console.warn('⚠️  Firebase Admin not initialized. Server will continue without auth verification.');
}

export default firebaseAdmin;
export const auth = firebaseAdmin ? admin.auth() : null;
