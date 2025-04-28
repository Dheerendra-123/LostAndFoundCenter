const UserModel = require("../Models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


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
        console.error("Registration Error:", error.message, error.stack);
        return res.status(500).json({ message: `Server error: ${error.message}`, success: false });
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
        res.status(500).json({ message: `Server error: ${error.message}`, success: false });
    }
};


module.exports = { 
    signupController, 
    loginController
};