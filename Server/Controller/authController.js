const UserModel = require("../Models/User");
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');


const signupController = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.json({ message: "All fields are required", success: false });
    }

    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.json({ message: "User already exists", success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await UserModel.create({ name, email, password: hashedPassword });

        console.log("User Registered:", newUser);

        // Optionally auto-login after signup
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge:  60*60*1000
        });

        res.json({ message: "User registered successfully", success: true, user: { _id: newUser._id, name: newUser.name, email: newUser.email } });
    } catch (error) {
        console.log(error);
        res.json({ message: "Server error", success: false });
    }
};


const loginController = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ message: "All fields are required", success: false });
    }

    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.json({ message: "User does not exist", success: false });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.json({ message: "Invalid password", success: false });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60*60*1000,
            message:'cookie has been set'
        });

        res.json({
            message: "User logged in successfully",
            success: true,
            user: { _id: user._id, name: user.name, email: user.email },
            token:token,
        });

        console.log("user Logged In:",user,token);

    } catch (error) {
        console.error("Login Error:", error);
        res.json({ message: "Internal server error", success: false });
    }
};

//google auth controller


const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuthController = async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ message: "Token is required", success: false });
    }
    
    try {
        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        
        // Extract user information from Google payload
        const { email, name, picture: profilePicture, sub: googleId } = payload;
        
        // Check if user exists
        let user = await UserModel.findOne({ email });
        
        if (user) {
            // Update existing user with Google info if not already set
            if (!user.googleId) {
                user.googleId = googleId;
                user.profilePicture = user.profilePicture || profilePicture;
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
            
            console.log("Google User Registered:", user);
        }
        
        // Generate JWT token
        const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        
        // Set cookie
        res.cookie("token", jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000
        });
        
        // Return user data
        res.json({
            message: "Google authentication successful",
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });
        
    } catch (error) {
        console.error("Google Authentication Error:", error);
        res.status(401).json({ message: "Google authentication failed", success: false });
    }
};


module.exports = { signupController, loginController,googleAuthController };
