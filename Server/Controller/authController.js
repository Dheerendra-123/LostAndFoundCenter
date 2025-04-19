const UserModel = require("../Models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signupController = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }

    try {
        // Add timeout to the database query
        const existingUser = await Promise.race([
            UserModel.findOne({ email }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database query timeout')), 5000)
            )
        ]);
        
        if (existingUser) {
            return res.status(409).json({ message: "User already exists", success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await UserModel.create({ name, email, password: hashedPassword });

        console.log("User Registered:", newUser._id, newUser.email);

        // Generate JWT token for auto-login
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Set cookie with appropriate settings
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site
            maxAge: 60*60*1000
        });

        return res.status(201).json({ 
            message: "User registered successfully", 
            success: true, 
            user: { _id: newUser._id, name: newUser.name, email: newUser.email },
            token: token
        });
    } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

const loginController = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }

    try {
        // Add timeout to the database query
        const user = await Promise.race([
            UserModel.findOne({ email }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database query timeout')), 5000)
            )
        ]);

        if (!user) {
            return res.status(404).json({ message: "User does not exist", success: false });
        }

        // Handle Google auth users who don't have a password
        if (!user.password) {
            return res.status(401).json({ 
                message: "This account uses Google authentication", 
                success: false,
                authMethod: 'google'
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Invalid password", success: false });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Set appropriate headers for CORS
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site
            maxAge: 60*60*1000
        });

        // Return appropriate status code
        return res.status(200).json({
            message: "User logged in successfully",
            success: true,
            user: { _id: user._id, name: user.name, email: user.email },
            token: token
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

const googleAuthController = async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ message: "Token is required", success: false });
    }
    
    try {
        // Verify Google token with timeout
        const ticket = await Promise.race([
            googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Google verification timeout')), 5000)
            )
        ]);
        
        const payload = ticket.getPayload();
        
        // Extract user information from Google payload
        const { email, name, picture: profilePicture, sub: googleId } = payload;
        
        // Check if user exists with timeout
        let user = await Promise.race([
            UserModel.findOne({ email }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database query timeout')), 5000)
            )
        ]);
        
        if (user) {
            // Update existing user with Google info if not already set
            if (!user.googleId) {
                user.googleId = googleId;
                user.profilePicture = user.profilePicture || profilePicture;
                user.authMethod = 'google';
                await user.save();
            }
        } else {
            // Create new user
            user = await UserModel.create({
                name,
                email,
                googleId,
                profilePicture,
                password: null, // No password for Google users
                authMethod: 'google'
            });
            
            console.log("Google User Registered:", user._id, user.email);
        }
        
        // Generate JWT token
        const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        
        // Set cookie
        res.cookie("token", jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site
            maxAge: 60 * 60 * 1000
        });
        
        // Return user data
        return res.status(200).json({
            message: "Google authentication successful",
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture
            },
            token: jwtToken
        });
        
    } catch (error) {
        console.error("Google Authentication Error:", error);
        return res.status(401).json({ message: "Google authentication failed", success: false });
    }
};

module.exports = { 
    signupController, 
    loginController, 
    googleAuthController
};