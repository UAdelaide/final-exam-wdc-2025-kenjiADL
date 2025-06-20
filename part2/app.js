const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
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

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM '
})
// Export the app instead of listening here
module.exports = app;