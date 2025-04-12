const jwt = require('jsonwebtoken');

const ensureAuthentication = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized, token missing", success: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        console.error("Auth Error:", error);
        return res.status(401).json({ message: "Authorization failed or token expired", success: false });
    }
};

module.exports = ensureAuthentication;
