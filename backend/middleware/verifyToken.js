import { auth } from '../firebaseAdmin.js';

/**
 * Middleware to verify Firebase ID token
 * Extracts token from Authorization header and verifies it
 */
export const verifyToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: No token provided'
            });
        }

        const idToken = authHeader.split('Bearer ')[1];

        if (!auth) {
            console.warn('Firebase Admin not initialized, skipping token verification');
            // For development without Firebase Admin setup
            req.user = { uid: 'dev-user', email: 'dev@example.com' };
            return next();
        }

        // Verify the ID token
        const decodedToken = await auth.verifyIdToken(idToken);

        // Attach user info to request object
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name
        };

        next();
    } catch (error) {
        console.error('Token verification error:', error.message);

        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please sign in again.'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid token'
        });
    }
};
