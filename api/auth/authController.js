'use strict';

const appConfig = require('../../config/appConfig'),
    bcrypt = require('bcryptjs'),
    mailConfig = require('../../config/mailConfig'),
    mailer = require('../mailer'),
    userModel = require('../user/userModel'),
    uuidv4 = require('uuid/v4');

/**
 * Middleware to only run next() if user is logged in.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns {*}
 */
exports.loginRequired = function (req, res, next) {
    if (req.session.user && req.session.user.isAuthenticated) {
        next();
    } else {
        return res.status(401).json({
            'success': false,
            'message': 'Unauthorized user!'
        });
    }
};

/**
 * Return 401 unauthorized if user is not of required groups.
 * @param {*} req 
 * @param {*} res 
 * @param {*} groupsRequiredToContinue 
 */
exports.requiredGroups = function (req, res, groupsRequiredToContinue) {
    //TODO Implement Me!!!!
}

/**
 * Register a User, requires at least username, email, and password
 * @param {*} req
 * @param {*} res
 */
exports.register = function (req, res) {
    if (req.session.user && req.session.user.isAuthenticated) {
        return res.status(401).json({
            'success': false,
            'message': 'You must log out with current account before creating a new one!'
        });
    }

    if (!(req.body.username && req.body.email && req.body.password)) {
        return res.status(400).json({
            'success': false,
            'message': 'Valid username, email, and password required.'
        });
    }

    bcrypt.hash(req.body.password, appConfig.saltRounds).then(function (hashedPassword) {
        let verifyEmailCode = uuidv4();
        userModel.saveUser(req.body.username, req.body.email, hashedPassword, verifyEmailCode).then(function (userId) {
            userModel.getUserFromId(userId).then(function (user) {
                req.session.user = {
                    isAuthenticated: true,
                    id: user.id
                };

                sendEmailVerification(user.id, user.email, user.username, verifyEmailCode);

                return res.json({
                    'success': true,
                    'data': {
                        'user': user
                    }
                });
            }).catch((error) => {
                return res.status(400).json({
                    'success': false,
                    'message': "User registered, please login."
                });
            });
        }).catch((error) => {
            if (error.errno == 1062) {
                return res.status(400).json({
                    'success': false,
                    'message': "Email is already registered with another account."
                });
            } else {
                return res.status(400).json({
                    'success': false,
                    'message': "Unable to register user."
                });
            }
        });
    }).catch((error) => {
        return res.status(400).json({
            'success': false,
            'message': "Unable to register user."
        });
    })
};

/**
 * Login User if password matches
 * @param {*} req
 * @param {*} res
 */
exports.login = function (req, res) {
    if (req.session.user && req.session.user.isAuthenticated) {
        return res.status(400).json({
            'success': false,
            'message': 'A user is already logged in!'
        });
    }

    if (!(req.body.email && req.body.password)) {
        return res.status(400).json({
            'success': false,
            'message': 'Valid email and password required.'
        });
    }

    userModel.getUserFromEmail(req.body.email, true).then(function (user) {
        bcrypt.compare(req.body.password, user.password).then(function (isValid) {
            if (isValid) {
                req.session.user = {
                    isAuthenticated: true,
                    id: user.id
                };

                // Don't send back the hashed password!
                user.password = undefined;
                return res.json({
                    'success': true,
                    'data': {
                        'user': user
                    }
                });
            } else {
                res.status(401).json({
                    'success': false,
                    'message': "Authentication failed."
                });
            }
        }).catch((error) => {
            return res.status(401).json({
                'success': false,
                'message': "Authentication failed."
            });
        });
    }).catch((error) => {
        return res.status(401).json({
            'success': false,
            'message': "User was not found."
        });
    });
};

/**
 * Logout Current Session!
 * @param {*} req 
 * @param {*} res 
 */
exports.logout = function (req, res) {
    if (req.session.user && req.session.user.isAuthenticated) {
        req.session.destroy(function (error) {
            if (error) {
                res.status(400).json({
                    'success': false,
                    'message': "Unable to log you out!"
                });
            } else {
                res.json({
                    'success': true,
                    'message': "You have been successfully logged out!"
                });
            }
        });
    } else {
        res.json({
            'success': true,
            'message': "No one to logout."
        });
    }
}

/**
 * Change the User Password
 * @param {*} req 
 * @param {*} res 
 */
exports.changePassword = function (req, res) {
    if (!(req.body.currentPassword && req.body.newPassword)) {
        return res.status(400).json({
            'success': false,
            'message': "Valid currentPassword and newPassword required."
        });
    }

    userModel.getUserFromId(req.session.user.id, true).then(function (user) {
        bcrypt.compare(req.body.currentPassword, user.password).then(function (isValid) {
            if (isValid) {
                bcrypt.hash(req.body.newPassword, appConfig.saltRounds).then(function (hashedPassword) {
                    userModel.updateUser(user.id, ['password'], [hashedPassword]).then(function (user) {
                        return res.json({
                            'success': true,
                            'message': "Password successfully changed."
                        });
                    }).catch((err) => {
                        return res.status(400).json({
                            'success': false,
                            'message': "Issue changing passwords."
                        });
                    });
                }).catch((error) => {
                    res.status(401).json({
                        'success': false,
                        'message': "Issue changing passwords."
                    });
                });
            } else {
                res.status(401).json({
                    'success': false,
                    'message': "Authentication failed. Incorrect current password."
                });
            }
        }).catch((error) => {
            return res.status(401).json({
                'success': false,
                'message': "Authentication failed."
            });
        });
    }).catch((err) => {
        return res.status(400).json({
            'success': false,
            'message': "User was not found."
        });
    });
}

/**
 * Send an Email to User's Email for User Email Verification
 * @param {*} req 
 * @param {*} res 
 */
exports.resendEmailVerificationEmail = function (req, res) {
    userModel.getUserFromId(req.session.user.id, false, true).then((user) => {
        sendEmailVerification(user.id, user.email, user.username, user.verifyEmailCode);
        return res.json({
            'success': true,
            'message': "Email Sent."
        });
    }).catch((error) => {
        return res.status(400).json({
            'success': false,
            'message': "Error Sending Email."
        })
    })
}

/**
 * Use to Verify Email.
 * @param {*} req 
 * @param {*} res 
 */
exports.verifyEmail = function (req, res) {
    if (!(req.body.userId && req.body.verifyEmailCode)) {
        return res.status(400).json({
            'success': false,
            'message': "Must pass in valid userId and email code to verify email."
        });
    }

    userModel.getUserFromId(req.params.userId, false, true).then(function (user) {
        if (user.verifyEmailCode === req.params.verifyEmailCode) {
            userModel.updateUser(user.id, ['emailVerified'], [1]).then(function (user) {
                return res.json({
                    'success': true,
                    'message': "Email successfully verified."
                });
            }).catch((err) => {
                return res.status(400).json({
                    'success': false,
                    'message': "Could Not Verify Email."
                });
            });
        } else {
            return res.status(400).json({
                'success': false,
                'message': "Could Not Verify Email."
            });
        }
    }).catch((err) => {
        return res.status(400).json({
            'success': false,
            'message': "User was not found."
        });
    });
}

/**
 * Sends Email to Verify User's Email Address
 * @param {number} userId 
 * @param {string} email 
 * @param {string} username 
 * @param {string} verifyEmailCode 
 */
function sendEmailVerification(userId, email, username, verifyEmailCode) {
    let mailOptions = {
        from: mailConfig.user,
        to: email,
        subject: 'Welcome ' + username + '! Please Verify Your Email',
        html: '<h1>Welcome to ' + appConfig.applicationName + '!</h1><h2>Confirm your email address to get started!</h2><a href="' + appConfig.applicationDomain + '/api/auth/verifyEmail/' + userId + '/' + verifyEmailCode + '">Click Here to Verify Email</a>'
    };

    // send mail with defined transport object
    mailer.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: %s', info.messageId);
        }
    });
}