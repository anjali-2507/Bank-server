require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5000,
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'Bank'
    },
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiration: '24h'
};
