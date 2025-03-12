// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const authRoutes = require('./routes/auth');
const accountsRoutes = require('./routes/accounts');
const transactionsRoutes = require('./routes/transactions');
const { authenticateToken } = require('./middleware/auth');
const testRoutes = require('./routes/test');

const app = express();

// Middleware
app.use(cors({
    origin: 'https://bank-client-rust.vercel.app',
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', authenticateToken, accountsRoutes);
app.use('/api/transactions', authenticateToken, transactionsRoutes);
app.use('/api/test', testRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = config.port || process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Add these lines at the top of the file, right after the imports
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Application specific logging, throwing an error, or other logic here
    process.exit(1);
});
