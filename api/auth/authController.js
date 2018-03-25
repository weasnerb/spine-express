'use strict';

const appConfig = require('../../config/appConfig'),
    bcrypt = require('bcryptjs'),
    mailConfig = require('../../config/mailConfig'),
    mailer = require('../mailer'),
    QRCode = require('qrcode'),
    speakeasy = require('speakeasy'),
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
            'message': 'User not logged in!'
        });
    }
};

/**
 * Middleware to only run next() if user is of at least one required role.
 * Note: loginRequired does not need to be run before roleRequired.
 * @param {*} req 
 * @param {*} res 
 * @param {string|string[]} roleRequired (role, or one of roles required)
 */
exports.roleRequired = function (roleRequired) {
    return function (req, res, next) {
        exports.loginRequired(req, res, function () {
            userModel.getUserRoles(req.session.user.id).then(function (userRoles) {
                if (typeof roleRequired == 'string') {
                    if (userRoles.indexOf(roleRequired) > -1) {
                        next();
                        return;
                    }
                } else if (Array.isArray(roleRequired)) {
                    for (let role of roleRequired) {
                        if (userRoles.indexOf(role) > -1) {
                            next();
                            return;
                        }
                    }
                }

                return res.status(401).json({
                    'success': false,
                    'message': 'User does not have required role!'
                });

            }).catch((error) => {
                return res.status(401).json({
                    'success': false,
                    'message': 'Unable to check if user has required role!'
                });
            })
        })
    }
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
            userModel.getUserById(userId).then(function (user) {
                if (appConfig.useMailer) {
                    sendEmailVerification(user.id, user.email, user.username, verifyEmailCode);
                }

                // Start authenticated session only if user has verified email
                if (!appConfig.requireVerifiedEmailToLogin) {
                    req.session.user = {
                        isAuthenticated: true,
                        id: user.id,
                        email: user.email
                    };
                }

                // Always Logged in as soon as registered as no mfa is immediately set.
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

    userModel.getUserByEmail(req.body.email, true, false, true).then(function (user) {
        if (appConfig.requireVerifiedEmailToLogin && user.emailVerified == 0) {
            return res.status(401).json({
                'success': false,
                'message': "User must verify email before they can login."
            });
        }

        bcrypt.compare(req.body.password, user.password).then(function (isValid) {
            if (isValid) {
                req.session.user = {
                    isAuthenticated: (user.mfaSecret) ? false : true,
                    awaitingMFA: (user.mfaSecret) ? true : undefined,
                    id: user.id,
                    email: user.email
                };

                // Don't send back the hashed password or mfa secret!
                user.password = undefined;
                user.mfaSecret = undefined;
                if (req.session.user.awaitingMFA) {
                    return res.json({
                        'success': true,
                        'data': {
                            'awaitingMfaAuth': true,
                            'message': 'Awaiting Mfa verification to complete login.'
                        }
                    });
                } else {
                    return res.json({
                        'success': true,
                        'data': {
                            'user': user
                        }
                    });
                }
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
                    'data': {
                        'message': "You have been successfully logged out!"
                    }
                });
            }
        });
    } else {
        res.json({
            'success': true,
            'data': {
                'message': "No one to logout."
            }
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

    userModel.getUserById(req.session.user.id, true).then(function (user) {
        bcrypt.compare(req.body.currentPassword, user.password).then(function (isValid) {
            if (isValid) {
                bcrypt.hash(req.body.newPassword, appConfig.saltRounds).then(function (hashedPassword) {
                    userModel.updateUser(user.id, ['password'], [hashedPassword]).then(function (user) {
                        return res.json({
                            'success': true,
                            'data': {
                                'message': "Password successfully changed."
                            }
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
 * Reset Forgotten Password
 * @param {*} req 
 * @param {*} res 
 */
exports.forgotPassword = function (req, res) {

}

/**
 * Get Mfa data for user to add to Mfa App
 * @param {*} req 
 * @param {*} res 
 */
exports.setupMfa = function (req, res) {
    var secret = speakeasy.generateSecret();
    var otpauthURL = speakeasy.otpauthURL({ 'secret': secret.ascii, 'label': req.session.user.email, 'issuer': appConfig.applicationName });

    userModel.updateUser(req.session.user.id, ['tempMfaSecret'], [secret.base32]).then(() => {
        QRCode.toDataURL(otpauthURL)
            .then(url => {
                req.session.user.awaitingMFA = true;
                return res.json({
                    'success': true,
                    'data': {
                        'base32': secret.base32,
                        'QRCodeImgData': url
                    }
                });
            })
            .catch(error => {
                return res.status(400).json({
                    'success': false,
                    'message': "Issue Generating QR Code"
                });
            });
    }).catch((error) => {
        return res.status(400).json({
            'success': false,
            'message': "Could not save a temporary MfaSecret for later validation."
        });
    });
}

/**
 * Verify Temp Mfa Token to complete setup of Mfa on logged in account
 * @param {*} req 
 * @param {*} res 
 */
exports.verifyTempMfaToken = function (req, res) {
    if (!(req.body.token)) {
        return res.status(400).json({
            'success': false,
            'message': "Must pass in valid token to verify Two Factor Auth."
        });
    }
    if (!req.session.user || !req.session.user.isAuthenticated || !req.session.user.awaitingMFA) {
        return res.status(400).json({
            'success': false,
            'message': "Mfa Verification is not required at this time."
        });
    }

    userModel.getUserById(req.session.user.id, false, false, true, true).then((user) => {
        if (user.mfaSecret) {
            return res.status(400).json({
                'success': false,
                'message': "Mfa Verification is already enabled."
            });
        }

        var verified = speakeasy.totp.verify({ secret: user.tempMfaSecret, encoding: 'base32', token: req.body.token });
        if (verified) {
            userModel.updateUser(req.session.user.id, ['tempMfaSecret', 'mfaSecret'], [null, user.tempMfaSecret]).then(() => {
                req.session.user.awaitingMFA = false;
                return res.json({
                    'success': true,
                    'data': "Token was successfully verified and MFA is now setup."
                });
            }).catch((error) => {
                return res.status(400).json({
                    'success': false,
                    'message': "Could Not Setup MFA."
                });
            });
        } else {
            return res.status(400).json({
                'success': false,
                'message': "Token is not valid."
            });
        }
    }).catch((error) => {
        return res.status(400).json({
            'success': false,
            'message': "Could Not Verify Token."
        });
    });
}

/**
 * Used to Verify Mfa Token to Login
 * @param {*} req 
 * @param {*} res 
 */
exports.verifyMfaToken = function (req, res) {
    if (!(req.body.token)) {
        return res.status(400).json({
            'success': false,
            'message': "Must pass in valid token to verify Two Factor Auth."
        });
    }
    if (!req.session.user || req.session.user.isAuthenticated || !req.session.user.awaitingMFA) {
        return res.status(400).json({
            'success': false,
            'message': "Mfa Verification is not required at this time."
        });
    }

    userModel.getUserById(req.session.user.id, false, false, true).then((user) => {
        var verified = speakeasy.totp.verify({ secret: user.mfaSecret, encoding: 'base32', token: req.body.token });
        if (verified) {
            req.session.user.isAuthenticated = true;
            req.session.user.awaitingMFA = false;
            user.mfaSecret = undefined;
            return res.json({
                'success': true,
                'data': { 'user': user }
            });
        } else {
            return res.status(400).json({
                'success': false,
                'message': "Token is not valid."
            });
        }
    }).catch((error) => {
        return res.status(400).json({
            'success': false,
            'message': "Could Not Verify Token."
        });
    });
}

/**
 * Remove Mfa functionality from current user
 * @param {*} req 
 * @param {*} res 
 */
exports.removeMfa = function (req, res) {
    userModel.updateUser(req.session.user.id, ['tempMfaSecret', 'mfaSecret'], [null, null]).then(() => {
        return res.json({
            'success': true,
            'data': "Mfa was successfully disabled."
        });
    }).catch((error) => {
        return res.status(400).json({
            'success': false,
            'message': "Could not disable MFA."
        });
    });
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
            'message': "Must pass in valid userId and verifyEmailCode to verify email."
        });
    }

    userModel.getUserById(req.params.userId, false, true).then(function (user) {
        if (user.verifyEmailCode === req.params.verifyEmailCode) {
            userModel.updateUser(user.id, ['emailVerified'], [1]).then(function (user) {
                return res.json({
                    'success': true,
                    'data': {
                        'message': "Email successfully verified."
                    }
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
 * Send an Email to User's Email for User Email Verification
 * @param {*} req 
 * @param {*} res 
 */
exports.resendEmailVerificationEmail = function (req, res) {
    userModel.getUserById(req.session.user.id, false, true).then((user) => {
        sendEmailVerification(user.id, user.email, user.username, user.verifyEmailCode);
        return res.json({
            'success': true,
            'data': {
                'message': "Email Sent."
            }
        });
    }).catch((error) => {
        return res.status(400).json({
            'success': false,
            'message': "Error Sending Email."
        })
    })
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