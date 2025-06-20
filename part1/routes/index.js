const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'DogWalkService'
});

var express = require('express');
var router = express.Router();

db.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err);
  }
  else {
    console.log('Connected to DB from route file');
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/dogs', (req, res) => {
  const sql = 'SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username FROM Dogs JOIN Users ON Dogs.owner_id = Users.user_id';
  db.query (sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});

router.get('/api/walkrequests/open', (req, res) => {
  const sql = 'SELECT WalkRequests'
})
module.exports = router;