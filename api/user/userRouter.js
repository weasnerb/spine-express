const express = require('express'),
    router = express.Router(),
    authController = require('../auth/authController'),
    userController = require('./userController');

/**
 * To make login required, use the middleware userController.loginRequired
 */
router.get('/', authController.loginRequired, userController.getLoggedInUser);

router.delete('/', authController.loginRequired, userController.deleteLoggedInUser);

// Need to export the router variable for use in api.js.
module.exports = router;