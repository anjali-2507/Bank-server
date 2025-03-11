const express = require('express');
const db = require('../db/connection');
const { authorizeBanker } = require('../middleware/auth');

const router = express.Router();

// Get customer's own transactions
router.get('/me', async (req, res) => {
    try {
        const userId = req.user.id;

        const [accounts] = await db.execute(
            'SELECT id FROM Accounts WHERE userId = ?',
            [userId]
        );

        if (accounts.length === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const accountId = accounts[0].id;

        const [transactions] = await db.execute(
            'SELECT * FROM Transactions WHERE accountId = ? ORDER BY createdAt DESC',
            [accountId]
        );

        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get transactions for an account (banker only)
router.get('/account/:accountId', authorizeBanker, async (req, res) => {
    try {
        const { accountId } = req.params;

        const [transactions] = await db.execute(
            'SELECT * FROM Transactions WHERE accountId = ? ORDER BY createdAt DESC',
            [accountId]
        );

        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Deposit funds
router.post('/deposit', async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, description } = req.body;

        if (!amount || parseFloat(amount) <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Get user's account
            const [accounts] = await connection.execute(
                'SELECT * FROM Accounts WHERE userId = ?',
                [userId]
            );

            if (accounts.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Account not found' });
            }

            const account = accounts[0];
            const newBalance = parseFloat(account.balance) + parseFloat(amount);

            // Update account balance
            await connection.execute(
                'UPDATE Accounts SET balance = ? WHERE id = ?',
                [newBalance, account.id]
            );

            // Create transaction record
            await connection.execute(
                'INSERT INTO Transactions (accountId, type, amount, balance, description) VALUES (?, ?, ?, ?, ?)',
                [account.id, 'deposit', amount, newBalance, description || 'Deposit']
            );

            await connection.commit();

            res.json({ message: 'Deposit successful', balance: newBalance });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Withdraw funds
router.post('/withdraw', async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, description } = req.body;

        if (!amount || parseFloat(amount) <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Get user's account
            const [accounts] = await connection.execute(
                'SELECT * FROM Accounts WHERE userId = ?',
                [userId]
            );

            if (accounts.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Account not found' });
            }

            const account = accounts[0];

            // Check if sufficient balance
            if (parseFloat(account.balance) < parseFloat(amount)) {
                await connection.rollback();
                return res.status(400).json({ message: 'Insufficient funds' });
            }

            const newBalance = parseFloat(account.balance) - parseFloat(amount);

            // Update account balance
            await connection.execute(
                'UPDATE Accounts SET balance = ? WHERE id = ?',
                [newBalance, account.id]
            );

            // Create transaction record
            await connection.execute(
                'INSERT INTO Transactions (accountId, type, amount, balance, description) VALUES (?, ?, ?, ?, ?)',
                [account.id, 'withdrawal', amount, newBalance, description || 'Withdrawal']
            );

            await connection.commit();

            res.json({ message: 'Withdrawal successful', balance: newBalance });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
