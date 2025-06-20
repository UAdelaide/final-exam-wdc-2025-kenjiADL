const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'DogWalkService'
});

db.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err);
  }
  else {
    console.log('Connected to DB from route file');
  }
});

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


app.get('/api/dogs', (req, res) => {
  const sql = 'SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username FROM Dogs JOIN Users ON Dogs.owner_id = Users.user_id';
  db.query (sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});

app.get('/api/walkrequests/open', (req, res) => {
    const sql = 'SELECT WalkRequests.request_id, Dogs.name AS dog_name, WalkRequests.requested_time, WalkRequests.duration_minutes, WalkRequests.location, Users.username AS owner_username FROM WalkRequests JOIN Dogs ON WalkRequests.dog_id = Dogs.dog_id JOIN Users ON Dogs.owner_id = Users.user_id WHERE WalkRequests.status = "open" ';

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

app.get('/api/walkers/summary', (req, res) => {
    const sql = 'SELECT u.username AS walker_username, COUNT(r.rating_id) AS total_ratings, ROUND(AVG(r.rating), 1) AS average_rating, SUM(CASE WHEN wr.status = "completed" THEN 1 ELSE 0 END) AS completed_walks FROM Users u LEFT JOIN WalkRatings r ON u.user_id = r.walker_id LEFT JOIN WalkRequests wr ON wr.request_id = r.request_id WHERE u.role = "walker" GROUP BY u.username';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query failed ' });
        }
    res.json(results);
    });
});

module.exports = app;