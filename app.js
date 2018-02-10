'use strict';

const express = require('express'),
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
  authController.verifyAndDecodeJwt(req, res, next)
});

// TODO: is this needed
var db = require('./api/mySql');

/**
 * Routing
 */
// Set layer /api of requests using api
const api = require('./api/apiRouter');
app.use('/api', api);

/**
 * Serve Static Files
 */
if (appConfig.staticRoute || appConfig.staticRoute !== '******') {
  app.use(express.static(appConfig.staticRoute));
}

module.exports = app;