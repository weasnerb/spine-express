/**
 * SQL Connection
 */
var mysql = require('mysql');

var dbConfig = require('../config/dbConfig');
var connection = mysql.createConnection({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database
});

connection.connect(function(err) {
  if (err) throw err;
});

module.exports = connection;