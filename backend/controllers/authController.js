import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

// In-memory storage for when MongoDB is not available
const inMemoryUsers = new Map();
let userIdCounter = 1;

/**
 * @desc    Login or register user (auto-signup)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
    try {
        const { name, email, googleId } = req.body;

        // Validate required fields
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
            });
        }

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Name is required',
            });
        }

        let user;
        const isMongoConnected = mongoose.connection.readyState === 1;

        if (isMongoConnected) {
            // Use MongoDB
            // Check if user exists
            user = await User.findOne({ email });

            // If user doesn't exist, create new user (auto-signup)
            if (!user) {
                user = await User.create({
                    name,
                    email,
                    googleId: googleId || undefined,
                });

                console.log(`New user created: ${user.email}`);
            } else {
                // Update user info if needed
                let updated = false;
                if (googleId && !user.googleId) {
                    user.googleId = googleId;
                    updated = true;
                }
                if (user.name !== name) {
                    user.name = name;
                    updated = true;
                }
                if (updated) {
                    await user.save();
                }

                console.log(`Existing user logged in: ${user.email}`);
            }
        } else {
            // Use in-memory storage
            console.log('Using in-memory storage (MongoDB not connected)');

            // Check if user exists
            user = Array.from(inMemoryUsers.values()).find(u => u.email === email);

            if (!user) {
                // Create new user
                user = {
                    _id: `user_${userIdCounter++}`,
                    id: `user_${userIdCounter}`,
                    name,
                    email,
                    googleId: googleId || null,
                    createdAt: new Date(),
                };
                inMemoryUsers.set(user.email, user);
                console.log(`New in-memory user created: ${user.email}`);
            } else {
                // Update user info if needed
                if (googleId && !user.googleId) {
                    user.googleId = googleId;
                }
                if (user.name !== name) {
                    user.name = name;
                }
                console.log(`Existing in-memory user logged in: ${user.email}`);
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE || '30d',
            }
        );

        res.status(200).json({
            success: true,
            message: user.isNew ? 'User registered successfully' : 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Login error:', error);

        // Handle duplicate key error (email already exists)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered',
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * @desc    Verify JWT token
 * @route   GET /api/auth/verify
 * @access  Private
 */
export const verifyToken = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-__v');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during verification',
        });
    }
};
