'use strict';

var appConfig = require('../../config/appConfig'),
    bcrypt = require('bcrypt'),
    db = require('../mySql'),
    jwt = require('jsonwebtoken'),
    userController = require('../user/userController');

exports.checkIfLoggedIn = function (req, res, next) {
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
        jwt.verify(req.headers.authorization.split(' ')[1], appConfig.name, function (err, decode) {
            if (err) {
                req.user = undefined;
            } else {
                req.user = decode;
            }
            next();
        });
    } else {
        req.user = undefined;
        next();
    }
}

/**
 * Middleware to only run next() if user is logged in.
 * @param req
 * @param res
 * @param next
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
 * @param req
 * @param res
 */
exports.register = function (req, res) {
    if (req.body.username && req.body.email && req.body.password) {
        var hashedPassword = bcrypt.hashSync(req.body.password, appConfig.saltRounds);

        userController.saveUser(req.body.username, req.body.email, hashedPassword)
            .then(function (user) {
                // Don't send back the hashed password!
                user.password = undefined;
                return res.json({
                    'token': "JWT " + signJWT(user.id, user.username, user.email),
                    'user': user
                });
            }).catch((err) => {
                return res.status(400).json({
                    message: err.errmsg
                });
            });
    } else {
        return res.status(400).json({
            message: 'Valid username, email, and password required'
        });
    }

};

/**
 * Login User if password matches
 * @param req
 * @param res
 */
exports.login = function (req, res) {
    if (req.body.email && req.body.password) {
        var promise = userController.getUserFromEmail(req.body.email);
        promise.then(function (user) {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                // Don't send back the hashed password!
                user.password = undefined;
                return res.json({
                    'token': "JWT " + signJWT(user.id, user.username, user.email),
                    'user': user
                });
            } else {
                res.status(401).json({
                    message: 'Authentication failed. Wrong password.'
                });
            }
        }).catch((err) => {
            return res.status(400).json({
                message: err.errmsg
            });
        });
    } else {
        return res.status(400).json({
            message: 'Valid email and password required'
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
        userController.getUserFromId(req.user.id)
            .then(function (user) {
                if (req.body.currentPassword && req.body.newPassword) {
                    if (bcrypt.compareSync(req.body.currentPassword, user.password)) {
                        var hashedPassword = bcrypt.hashSync(req.body.newPassword, appConfig.saltRounds);

                        userController.updateUser(user.id, ['password'], [hashedPassword])
                            .then(function (user) {
                                user.hashPassword = undefined;
                                return res.json({
                                    'user': user
                                });
                            })
                            .catch((err) => {
                                return res.status(400).json({
                                    message: err.errmsg
                                });
                            });
                    } else {
                        res.status(401).json({
                            message: 'Could Not Change Password, Incorrect Current Password.'
                        });
                    }
                } else {
                    res.status(400).json({
                        message: 'No currentPassword and/or newPassword passed in'
                    });
                }
            }).catch((err) => {
                return res.status(400).json({
                    message: err.errmsg
                });
            });
    } else {
        return res.status(400).json({
            message: 'Valid currentPassword and newPassword required'
        });
    }
}

/**
 * Sign JWT
 * @param {*} userId 
 * @param {*} username 
 * @param {*} email 
 */
function signJWT(userId, username, email) {
    return jwt.sign({
        id: userId,
        username: username,
        email: email
    }, appConfig.name);
}