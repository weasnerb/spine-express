'use strict';

const appConfig = require('../../config/appConfig'),
    bcrypt = require('bcryptjs'),
    jwt = require('jsonwebtoken'),
    mailConfig = require('../../config/mailConfig'),
    mailer = require('../mailer'),
    userModel = require('../user/userModel'),
    uuidv4 = require('uuid/v4');

/**
 * Middleware to check if request's authorization header is valid, if valid it sets req.user to decoded data.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.verifyAndDecodeJwt = function (req, res, next) {
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
        jwt.verify(req.headers.authorization.split(' ')[1], appConfig.secret, function (error, decode) {
            req.user = (error) ? undefined : decode;
            next();
        });
    } else {
        req.user = undefined;
        next();
    }
}

/**
 * Middleware to only run next() if user is logged in.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns {*}
 */
exports.loginRequired = function (req, res, next) {
    if (req.user) {
        next();
    } else {
        return res.status(401).json({
            message: 'Unauthorized user!'
        });
    }
};

/**
 * Register a User, requires at least username, email, and password
 * @param {*} req
 * @param {*} res
 */
exports.register = function (req, res) {
    if (req.body.username && req.body.email && req.body.password) {
        bcrypt.hash(req.body.password, appConfig.saltRounds).then(function (hashedPassword) {
            userModel.saveUser(req.body.username, req.body.email, hashedPassword, uuidv4()).then(function (userId) {
                userModel.getUserFromId(userId, false, true).then(function (user) {
                    sendEmailVerification(user.id, user.email, user.username, user.verifyEmailCode);
                    return res.json({
                        'token': "JWT " + signJWT(user.id, user.username, user.email),
                        'user': user
                    });
                }).catch((error) => {
                    return res.status(400).json({
                        message: "User registered, please login."
                    });
                });
            }).catch((error) => {
                return res.status(400).json({
                    message: "Unable to register user."
                });
            });
        }).catch((error) => {
            message: "Unable to register user."
        })
    } else {
        return res.status(400).json({
            message: 'Valid username, email, and password required.'
        });
    }
};

/**
 * Login User if password matches
 * @param {*} req
 * @param {*} res
 */
exports.login = function (req, res) {
    if (req.body.email && req.body.password) {
        userModel.getUserFromEmail(req.body.email, true).then(function (user) {
            bcrypt.compare(req.body.password, user.password).then(function (isValid) {
                if (isValid) {
                    // Don't send back the hashed password!
                    user.password = undefined;
                    return res.json({
                        'token': "JWT " + signJWT(user.id, user.username, user.email),
                        'user': user
                    });
                } else {
                    res.status(401).json({
                        message: "Authentication failed."
                    });
                }
            }).catch((error) => {
                return res.status(401).json({
                    message: "Authentication failed."
                });
            });
        }).catch((error) => {
            return res.status(401).json({
                message: "User was not found."
            });
        });
    } else {
        return res.status(400).json({
            message: 'Valid email and password required.'
        });
    }
};

/**
 * Change the User Password
 * @param {*} req 
 * @param {*} res 
 */
exports.changePassword = function (req, res) {
    if (req.body.currentPassword && req.body.newPassword) {
        userModel.getUserFromId(req.user.id, true).then(function (user) {
            bcrypt.compare(req.body.currentPassword, user.password).then(function (isValid) {
                if (isValid) {
                    bcrypt.hash(req.body.newPassword, appConfig.saltRounds).then(function (hashedPassword) {
                        userModel.updateUser(user.id, ['password'], [hashedPassword]).then(function (user) {
                            return res.json({
                                message: "Password successfully changed."
                            });
                        }).catch((err) => {
                            return res.status(400).json({
                                message: "Issue changing passwords."
                            });
                        });
                    }).catch((error) => {
                        res.status(401).json({
                            message: "Issue changing passwords."
                        });
                    });
                } else {
                    res.status(401).json({
                        message: "Authentication failed. Incorrect current password."
                    });
                }
            }).catch((error) => {
                return res.status(401).json({
                    message: "Authentication failed."
                });
            });
        }).catch((err) => {
            return res.status(400).json({
                message: "User was not found."
            });
        });
    } else {
        return res.status(400).json({
            message: "Valid currentPassword and newPassword required."
        });
    }
}

/**
 * Use to Verify Email.
 * @param {*} req 
 * @param {*} res 
 */
exports.verifyEmail = function(req, res) {
    if (req.params.userId && req.params.verifyEmailCode) {
        userModel.getUserFromId(req.params.userId, false, true).then(function (user) {
            if (user.verifyEmailCode === req.params.verifyEmailCode) {
                    userModel.updateUser(user.id, ['emailVerified'], [1]).then(function (user) {
                    return res.json({
                        message: "Email successfully verified."
                    });
                }).catch((err) => {
                    return res.status(400).json({
                        message: "Could Not Verify Email."
                    });
                });
            } else {
                return res.status(400).json({
                    message: "Could Not Verify Email."
                });
            }
        }).catch((err) => {
            return res.status(400).json({
                message: "User was not found."
            });
        });
    } else {
        return res.status(400).json( {
            message: "Must pass in valid userId and email code to verify email."
        });
    }
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
        subject: 'Verify Email',
        html: '<h1>Verify Email</h1><a href="/api/auth/verifyEmail/' + userId + '/' + verifyEmailCode + '">Click Here to Verify Email</a>'
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

/**
 * Sign JWT
 * @param {number} userId 
 * @param {string} username 
 * @param {string} email 
 */
function signJWT(userId, username, email) {
    return jwt.sign({
        id: userId,
        username: username,
        email: email
    }, appConfig.secret);
}