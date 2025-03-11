const express = require('express');
const pool = require('../db/connection');
const router = express.Router();

router.get('/ping', (req, res) => {
    res.json({ message: 'Server is running' });
});

router.get('/db-test', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT 1 as result');
        res.json({ message: 'Database connection successful', data: rows });
    } catch (error) {
        console.error('Database test failed:', error);
        res.status(500).json({ message: 'Database connection failed', error: error.message });
    }
});

module.exports = router; 