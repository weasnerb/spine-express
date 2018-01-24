var express = require('express'),
    api = express();

// Set /api/auth to use auth.js
var auth = require('./auth/authRouter');
api.use('/auth', auth);

// Set /api/user to use user
var user = require('./user/userRouter');
api.use('/user', user); 

// Need to export the api variable for use in app.js.
module.exports = api;