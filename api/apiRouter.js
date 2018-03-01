const express = require('express'),
    api = express();

// Set /api/auth to use auth.js
const auth = require('./auth/authRouter');
api.use('/auth', auth);

// Set /api/user to use user
const user = require('./user/userRouter');
api.use('/user', user);

// Set /api/role to use role
const role = require('./role/roleRouter');
api.use('/role', role);

// Need to export the api variable for use in app.js.
module.exports = api;