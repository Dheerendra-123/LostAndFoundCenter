const UserModel = require("../Models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


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
            maxAge: 24 * 60 * 60 * 1000
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
            maxAge: 60 * 60 * 1000,//for 1 hour
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

module.exports = { signupController, loginController };
