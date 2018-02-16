'use strict';

/**
 * SQL Connection
 */
const mysql = require('mysql');

const dbConfig = require('../config/dbConfig');
const connection = mysql.createConnection({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database
});

connection.connect(function (error) {
  if (error) console.log(error);
});

module.exports = connection;