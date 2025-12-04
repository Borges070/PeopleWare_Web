const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve index.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Database Setup
const dbPath = path.resolve(__dirname, 'database.db');
const db = new Database(dbPath);
console.log('Connected to the SQLite database.');

// Create Tables
try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            university TEXT
        );
        CREATE TABLE IF NOT EXISTS user_graphs (
            user_id INTEGER PRIMARY KEY,
            data TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    `);
    console.log('Tables ready.');
} catch (err) {
    console.error('Error creating tables:', err.message);
}

// Routes

// Register
app.post('/register', (req, res) => {
    const { name, email, password, university } = req.body;

    if (!email || !password || !university) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const stmt = db.prepare('INSERT INTO users (name, email, password, university) VALUES (?, ?, ?, ?)');
        const info = stmt.run(name, email, password, university);
        res.json({ message: 'User registered successfully', id: info.lastInsertRowid });
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Email already registered' });
        }
        return res.status(500).json({ error: err.message });
    }
});

// Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
    }

    try {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?');
        const row = stmt.get(email, password);

        if (row) {
            res.json({ message: 'Login successful', user: { id: row.id, name: row.name, email: row.email, university: row.university } });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save Graph
app.post('/graph', (req, res) => {
    const { userId, data } = req.body;

    if (!userId || !data) {
        return res.status(400).json({ error: 'Missing userId or data' });
    }

    try {
        const stmt = db.prepare('INSERT OR REPLACE INTO user_graphs (user_id, data) VALUES (?, ?)');
        stmt.run(userId, JSON.stringify(data));
        res.json({ message: 'Graph saved successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Graph
app.get('/graph/:userId', (req, res) => {
    const userId = req.params.userId;

    try {
        const stmt = db.prepare('SELECT data FROM user_graphs WHERE user_id = ?');
        const row = stmt.get(userId);

        if (row) {
            res.json({ data: JSON.parse(row.data) });
        } else {
            res.json({ data: null });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
