
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const { execute } = require('../config/db');

// ── LOGIN ──────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required.'
            });
        }

        // Fetch user from DB
        const result = await execute(
            `SELECT UserIdNum, UserId, Username, Email,
                    PasswordHash, Role, IsActive
             FROM   Users
             WHERE  Username = :username
             OR     Email    = :username`,
            { username }
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password.'
            });
        }

        const user = result.rows[0];

        // Check active status
        if (user.ISACTIVE === 0) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Contact administrator.'
            });
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.PASSWORDHASH
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password.'
            });
        }

        // Update LastLogin
        await execute(
            `UPDATE Users
             SET    LastLogin = SYSTIMESTAMP,
                    UpdatedAt = SYSTIMESTAMP
             WHERE  UserId = :userId`,
            { userId: user.USERID }
        );

        // Generate JWT
        const token = jwt.sign(
            {
                userId:   user.USERID,
                username: user.USERNAME,
                email:    user.EMAIL,
                role:     user.ROLE
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                userId:   user.USERID,
                username: user.USERNAME,
                email:    user.EMAIL,
                role:     user.ROLE
            }
        });

    } catch (err) {
        console.error('Login error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server error during login.'
        });
    }
};

// ── CHANGE PASSWORD ────────────────────────────────────────
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current and new password are required.'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters.'
            });
        }

        // Get current hash
        const result = await execute(
            `SELECT PasswordHash FROM Users WHERE UserId = :userId`,
            { userId }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const match = await bcrypt.compare(
            currentPassword,
            result.rows[0].PASSWORDHASH
        );

        if (!match) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect.'
            });
        }

        // Hash new password
        const newHash = await bcrypt.hash(newPassword, 12);

        await execute(
            `UPDATE Users
             SET    PasswordHash = :hash,
                    UpdatedAt    = SYSTIMESTAMP
             WHERE  UserId = :userId`,
            { hash: newHash, userId }
        );

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully.'
        });

    } catch (err) {
        console.error('Change password error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server error while changing password.'
        });
    }
};

// ── GET CURRENT USER ───────────────────────────────────────
const getMe = async (req, res) => {
    try {
        const result = await execute(
            `SELECT UserId, Username, Email, Role,
                    IsActive,
                    TO_CHAR(LastLogin, 'DD-Mon-YYYY HH24:MI') AS LastLogin,
                    TO_CHAR(CreatedAt, 'DD-Mon-YYYY HH24:MI') AS CreatedAt
             FROM   Users
             WHERE  UserId = :userId`,
            { userId: req.user.userId }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (err) {
        console.error('Get me error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
};

module.exports = { login, changePassword, getMe };