var express = require('express'),
    appConfig = require('../../config/appConfig'),
    router = express.Router(),
    authController = require('./authController');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/login/mfa', authController.verifyMfaToken);

router.post('/logout', authController.logout);

router.post('/changePassword', authController.loginRequired, authController.changePassword);

router.get('/mfaSetup', authController.loginRequired, authController.setupMfa);

router.post('/mfaSetup', authController.verifyTempMfaToken)

if (appConfig.useMailer) {
    //router.post('/forgotPassword', authController.forgotPassword);

    router.post('/verifyEmail/', authController.verifyEmail);

    router.post('/verifyEmail/resendEmail', authController.loginRequired, authController.resendEmailVerificationEmail)
}

// Need to export the router variable for use in api.js.
module.exports = router;