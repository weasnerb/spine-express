var express = require('express'),
    router = express.Router(),
    authController = require('./authController');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/changePassword', authController.loginRequired, authController.changePassword);

router.post('/verifyEmail/resendEmail', authController.loginRequired, authController.resendEmailVerificationEmail)

router.get('/verifyEmail/:userId/:verifyEmailCode', authController.verifyEmail);

// Need to export the router variable for use in api.js.
module.exports = router;