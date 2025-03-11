const express = require('express');
const db = require('../db/connection');
const { authorizeBanker } = require('../middleware/auth');

const router = express.Router();

// Get all accounts (banker only)
router.get('/', authorizeBanker, async (req, res) => {
    try {
        const [accounts] = await db.execute(`
      SELECT a.id, a.accountNumber, a.balance, a.createdAt, u.username, u.fullName, u.email 
      FROM Accounts a
      JOIN Users u ON a.userId = u.id
      WHERE u.role = 'customer'
    `);

        res.json(accounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get customer's own account
router.get('/me', async (req, res) => {
    try {
        const userId = req.user.id;

        const [accounts] = await db.execute(
            'SELECT * FROM Accounts WHERE userId = ?',
            [userId]
        );

        if (accounts.length === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }

        res.json(accounts[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get account by ID (for banker)
router.get('/:id', authorizeBanker, async (req, res) => {
    try {
        const accountId = req.params.id;

        const [accounts] = await db.execute(`
      SELECT a.*, u.username, u.fullName, u.email 
      FROM Accounts a
      JOIN Users u ON a.userId = u.id
      WHERE a.id = ?
    `, [accountId]);

        if (accounts.length === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }

        res.json(accounts[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
