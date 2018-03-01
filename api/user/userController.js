'use strict';

const userModel = require('./userModel');

/**
 * Get a the current user
 * @param {*} req 
 * @param {*} res 
 */
exports.getLoggedInUser = function (req, res) {
    userModel.getUserFromId(req.session.user.id).then(function (user) {
        return res.json({
            'success': true,
            'data': {
                'user': user
            }
        });
    }).catch((error) => {
        return res.status(400).json({
            'success': false,
            'message': "Unable to retrieve user with id: " + req.session.user.id
        });
    })
};

/**
 * Delete a the current user
 * @param {*} req 
 * @param {*} res 
 */
exports.deleteLoggedInUser = function (req, res) {
    userModel.deleteUser(req.session.user.id).then(function (userId) {
        return res.json({
            'success': true,
            'data': {
                'deletedUserId': userId
            }
        });
    }).catch((error) => {
        return res.status(400).json({
            'success': false,
            'message': "Unable to delete user with id: " + req.session.user.id
        });
    })
};

/**
 * Gets the roles of the user
 * @param {*} req 
 * @param {*} res 
 */
exports.getUserRoles = function (req, res) {
    userModel.getUserRoles(req.session.user.id).then(function (userRoles) {
        return res.json({
            'success': true,
            'data': {
                'roles': userRoles
            }
        });
    }).catch((error) => {
        return res.status(400).json({
            'success': false,
            'message': "Unable to get the roles of user with id: " + req.session.user.id
        });
    })
}