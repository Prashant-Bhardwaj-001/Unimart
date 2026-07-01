const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            email
        });

        // 1. Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            });
        }

        // 2. CRITICAL ACCOUNT STATUS CHECK:
        // If the user account is inactive/suspended, block login immediately
        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: "🚨 Access Denied: Your account is currently suspended. Please contact the administrator."
            });
        }

        // 3. Verify security password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            });
        }

        // Update Last Login Audit Trail
        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive // Sent metadata to frontend for validation insurance
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    loginUser
};