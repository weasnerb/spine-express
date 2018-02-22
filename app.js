'use strict';

const express = require('express'),
  app = express(),
  appConfig = require('./config/appConfig'),
  authController = require('./api/auth/authController'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  expressSession = require('express-session');

/**
 * Top Level Parser Settings
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

/**
 * Configure and Setup Sessions
 */
let sessionConfig = {
  resave: true,
  saveUninitialized: false,
  secret: appConfig.secret
}

if (appConfig.sessionMaxAgeMs) {
  sessionConfig.cookie.maxAge = appConfig.sessionMaxAgeMs;
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sessionConfig.cookie.secure = true; // serve secure cookies
}

app.use(expressSession(sessionConfig));

/**
 * Routing
 */
// Set layer /api of requests using api
const api = require('./api/apiRouter');
app.use('/api', api);

/**
 * Serve Static Files
 */
if (appConfig.staticRoute) {
  app.use(express.static(appConfig.staticRoute));
}

module.exports = app;