const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
    console.log('Starting database initialization...');

    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    };

    console.log('Using connection config:', {
        host: config.host,
        user: config.user,
        // password hidden for security
    });

    let connection;

    try {
        // Create connection without specifying a database
        connection = await mysql.createConnection(config);
        console.log('Connected to MySQL server');

        // Create database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log(`Database '${process.env.DB_NAME}' created or already exists`);

        // Switch to the database
        await connection.query(`USE ${process.env.DB_NAME}`);
        console.log(`Using database '${process.env.DB_NAME}'`);

        // Read schema file
        const schemaFile = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaFile, 'utf8');

        // Split schema into separate statements
        const statements = schema
            .split(';')
            .filter(statement => statement.trim() !== '')
            .map(statement => statement + ';');

        // Execute each schema statement
        for (const statement of statements) {
            console.log('Executing SQL:', statement.substring(0, 50) + '...');
            await connection.query(statement);
        }

        console.log('Schema applied successfully');

        // Close connection
        await connection.end();
        console.log('Database initialization completed successfully');

    } catch (error) {
        console.error('Database initialization failed:', error);
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

// Run the initialization
initializeDatabase(); 