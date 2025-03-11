require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('Testing database connection...');
    console.log('DB Config:', {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME
    });

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connection successful!');

        // Try a simple query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('Query result:', rows);

        await connection.end();
        console.log('Connection closed.');
    } catch (err) {
        console.error('Connection failed:', err);
    }
}

testConnection(); 