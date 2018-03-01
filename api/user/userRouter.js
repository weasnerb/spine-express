const express = require('express'),
    router = express.Router(),
    authController = require('../auth/authController'),
    userController = require('./userController');

router.get('/', authController.loginRequired, userController.getLoggedInUser);

router.delete('/', authController.loginRequired, userController.deleteLoggedInUser);

router.get('/roles', authController.loginRequired, userController.getUserRoles);

// Need to export the router variable for use in api.js.
module.exports = router;