const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'dog-session-secret',
  resave: false,
  saveUninitialized: false
}));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'DogWalkService'
});

db.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

app.get('/api/dogs', (req, res) => {
  const sql = 'SELECT dog_id, owner_id, name, size FROM Dogs';
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});

// Get dogs that belong to the logged-in owner
app.get('/api/owner/dogs', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  //
  const sql = 'SELECT dog_id, name, size FROM Dogs WHERE owner_id = ?';
  db.query(sql, [req.session.user.id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});

// Fetch walk requests for the current owner's dogs
app.get('/api/walks', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const sql = `SELECT wr.request_id, d.name as dog_name, d.size, wr.requested_time,
               wr.duration_minutes, wr.location, wr.status
               FROM WalkRequests wr
               JOIN Dogs d ON wr.dog_id = d.dog_id
               WHERE d.owner_id = ?
               ORDER BY wr.created_at DESC`;
  db.query(sql, [req.session.user.id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});

// Create new walk request from form data
app.post('/api/walks', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const { dog_id, requested_time, duration_minutes, location } = req.body;
  const sql = 'INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location) VALUES (?, ?, ?, ?)';
  db.query(sql, [dog_id, requested_time, duration_minutes, location], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create walk request' });
    }
    res.json({ message: 'Walk request created', request_id: result.insertId });
  });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM Users WHERE username = ? AND password_hash = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password'});
        }

        req.session.user = {
            id: results[0].user_id,
            username: results[0].username,
            role: results[0].role
        };

        res.json({ role: results[0].role });
    });
});

// Logout endpoint to destroy session and clear cookies
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = app;