var express = require('express'),
  app = express(),
  appConfig = require('./config/appConfig'),
  authController = require('./api/auth/authController'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  logger = require('morgan');

/**
 * Logging
 */
app.use(logger('dev'));

/**
 * Top Level Parser Settings
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

/**
 * Set user to Decoded JWT user on every request
 */
app.use(function (req, res, next) {
  authController.checkIfLoggedIn(req, res, next)
});

var db = require('./api/mySql');

/**
 * Routing
 */
// Set layer /api of requests using api
var api = require('./api/apiRouter');
app.use('/api', api);

/**
 * Serve Static Files
 */
app.use(express.static('build'));


module.exports = app;