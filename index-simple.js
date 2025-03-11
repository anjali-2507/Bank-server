const express = require('express');
require('dotenv').config();

const app = express();

app.use(express.json());

// Simple test endpoint
app.get('/api/ping', (req, res) => {
    res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 