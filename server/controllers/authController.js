// server/controllers/authController.js
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export async function registerUser(req, res) {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User with that email already exists' });
        }

        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ success: false, message: 'Username is already taken' });
        }

        // Create new user (password is hashed by pre-save middleware)
        user = await User.create({
            username,
            email,
            password, // Mongoose pre-save hook will hash this
        });

        // Respond with success, user data, and a token
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    profilePicture: user.profilePicture,
                    bio: user.bio,
                    followers: user.followers,
                    following: user.following,
                    createdAt: user.createdAt,
                },
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        // Mongoose validation errors or other server errors
        console.error('Registration Error:', error);
        // Handle Mongoose validation errors specifically
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
        }
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
}


// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export async function loginUser(req, res) {
    const { email, password } = req.body;

    try {
        // Check if user exists (and select password field)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Compare entered password with hashed password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Login successful, send user data and token
        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            data: {
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    profilePicture: user.profilePicture,
                    bio: user.bio,
                    followers: user.followers,
                    following: user.following,
                    createdAt: user.createdAt,
                },
                token: generateToken(user._id),
            },
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
}