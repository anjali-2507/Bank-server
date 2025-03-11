const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/connection');
const config = require('../config/config');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    try {
        console.log('Registration request received:', req.body);
        const { username, email, password, fullName, role } = req.body;

        // Input validation
        if (!username || !email || !password || !fullName || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const [existingUsers] = await pool.execute(
            'SELECT * FROM Users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Begin transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Insert user
            const [userResult] = await connection.execute(
                'INSERT INTO Users (username, email, password, fullName, role) VALUES (?, ?, ?, ?, ?)',
                [username, email, hashedPassword, fullName, role]
            );

            // Create account for customer
            if (role === 'customer') {
                const accountNumber = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
                await connection.execute(
                    'INSERT INTO Accounts (userId, accountNumber, balance) VALUES (?, ?, ?)',
                    [userResult.insertId, accountNumber, 0]
                );
            }

            await connection.commit();
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Get user from database
        const [users] = await pool.execute(
            'SELECT * FROM Users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            config.jwtSecret,
            { expiresIn: config.jwtExpiration }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
