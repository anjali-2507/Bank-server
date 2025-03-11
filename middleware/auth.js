const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access token is required' });

    jwt.verify(token, config.jwtSecret, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

const authorizeBanker = (req, res, next) => {
    if (req.user.role !== 'banker') {
        return res.status(403).json({ message: 'Access denied: Banker role required' });
    }
    next();
};

module.exports = { authenticateToken, authorizeBanker }; 