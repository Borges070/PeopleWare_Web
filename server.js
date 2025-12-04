const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve index.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Database Setup
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTables();
    }
});

function createTables() {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        university TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Users table ready.');
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS user_graphs (
        user_id INTEGER PRIMARY KEY,
        data TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) {
            console.error('Error creating user_graphs table:', err.message);
        } else {
            console.log('User graphs table ready.');
        }
    });
}

// Routes

// Register
app.post('/register', (req, res) => {
    const { name, email, password, university } = req.body;

    if (!email || !password || !university) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = `INSERT INTO users (name, email, password, university) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, email, password, university], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Email already registered' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'User registered successfully', id: this.lastID });
    });
});

// Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
    }

    const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
    db.get(sql, [email, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json({ message: 'Login successful', user: { id: row.id, name: row.name, email: row.email, university: row.university } });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

// Save Graph
app.post('/graph', (req, res) => {
    const { userId, data } = req.body;

    if (!userId || !data) {
        return res.status(400).json({ error: 'Missing userId or data' });
    }

    const sql = `INSERT OR REPLACE INTO user_graphs (user_id, data) VALUES (?, ?)`;
    db.run(sql, [userId, JSON.stringify(data)], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Graph saved successfully' });
    });
});

// Get Graph
app.get('/graph/:userId', (req, res) => {
    const userId = req.params.userId;

    const sql = `SELECT data FROM user_graphs WHERE user_id = ?`;
    db.get(sql, [userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json({ data: JSON.parse(row.data) });
        } else {
            res.json({ data: null }); // No graph found, return null
        }
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
