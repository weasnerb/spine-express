'use strict';

var appConfig = require('../../config/appConfig'),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken');

exports.checkIfLoggedIn = function (req, res, next) {
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
        jsonwebtoken.verify(req.headers.authorization.split(' ')[1], appConfig.name, function (err, decode) {
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
        var newUser = new User(req.body);
        newUser.hashPassword = bcrypt.hashSync(req.body.password, 10);
        
        userController.saveUser(newUser)
            .then(function (user) {
                user.hashPassword = undefined;
                var token = jwt.sign({
                    email: user.email,
                    username: user.username,
                    _id: user._id
                }, 'CornHub');
                return res.json({
                    'token': "JWT " + token,
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
            if (user.comparePassword(req.body.password)) {
                if (!user.shoppingList) {
                    user.shoppingList = new ShoppingList();
                }
                if (!user.pantry) {
                    user.pantry = new Pantry();
                }
                user.hashPassword = undefined;
                var token = jwt.sign({
                    email: user.email,
                    username: user.username,
                    _id: user._id
                }, 'CornHub');
                return res.json({
                    'token': "JWT " + token,
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
        var promise = userController.getUserFromId(req.user._id);
        promise.then(function (user) {
            if (req.body.currentPassword && req.body.newPassword) {
                if (user.comparePassword(req.body.currentPassword)) {
                    user.hashPassword = bcrypt.hashSync(req.body.newPassword, 10);
                    userController.saveUser(user)
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