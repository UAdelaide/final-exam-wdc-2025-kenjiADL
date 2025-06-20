var express = require('express');
var router = express.Router();

const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost'
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
