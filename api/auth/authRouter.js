var express = require('express'),
    router = express.Router(),
    authController = require('./authController');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/logout', authController.logout);

router.post('/changePassword', authController.loginRequired, authController.changePassword);

router.post('/verifyEmail/', authController.verifyEmail);

router.post('/verifyEmail/resendEmail', authController.loginRequired, authController.resendEmailVerificationEmail)

// Need to export the router variable for use in api.js.
module.exports = router;