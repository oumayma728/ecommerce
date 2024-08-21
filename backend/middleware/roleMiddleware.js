const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret', async (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });

        // Fetch user details from the database
        req.user = await User.findById(user.id);
        if (!req.user) return res.status(404).json({ message: 'User not found' });

        next();
    });
};
