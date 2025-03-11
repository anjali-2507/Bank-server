const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a simple connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Simple function to test the connection
async function testConnection() {
    try {
        const [rows] = await pool.execute('SELECT 1 as connection_test');
        console.log('Database connection test successful:', rows);
    } catch (error) {
        console.error('Database connection test failed:', error);
        throw error;
    }
}

// Test the connection immediately
testConnection()
    .then(() => console.log('Ready to use pool'))
    .catch(err => {
        console.error('Fatal database connection error:', err);
        process.exit(1);
    });

module.exports = pool; 