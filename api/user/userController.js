'use strict';

const userModel = require('./userModel');

/**
 * Get a the current user
 * @param {*} req 
 * @param {*} res 
 */
exports.getLoggedInUser = function (req, res) {
    exports.getUserFromId(req.user.id).then(function (user) {
        return res.json({
            'user': user
        });
    }).catch((error) => {
        return res.status(400).json({
            message: "There was an issue retrieving user with id: " + req.user.id
        });
    })
};

/**
 * Delete a the current user
 * @param {*} req 
 * @param {*} res 
 */
exports.deleteLoggedInUser = function (req, res) {
    userModel.deleteUser(req.user.id).then(function (userId) {
        return res.json({
            deletedUserId: userId
        });
    }).catch((error) => {
        return res.status(400).json({
            message: "There was an issue deleting user with id: " + req.user.id
        });
    })
};