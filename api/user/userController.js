'use strict';

var db = require('../mySql');

/**
 * Get User from their _id
 * @param {} userId 
 */
exports.getUserFromId = function (userId) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Users WHERE id = ?', [userId], function (error, results, fields) {
            if (error) reject(error);
            resolve(results[0]);
        });
    });
};

/**
 * Get User from their email
 * @param {} userEmail 
 */
exports.getUserFromEmail = function (userEmail) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Users WHERE email = ?', [userEmail], function (error, results, fields) {
            if (error) reject(error);
            console.log(results);
            resolve(results[0]);
        });
    });
};

/**
 * Save the passed in user
 * @param {*} userToSave 
 */
exports.saveUser = function (username, email, password) {
    return new Promise((resolve, reject) => {
        console.log('Inserting', username, email, password);
        db.query('INSERT INTO Users SET username = ?, email = ?, password = ?', [username, email, password], function (error, results, fields) {
            if (error) {
                reject(error);
            } else {
                exports.getUserFromId(results.insertId).then(function(user) {
                    resolve(user);
                }).catch((err) => {
                    reject(err);
                })
            }
        });
    });
};

/**
 * Save the passed in user
 * @param {*} userToSave 
 */
exports.updateUser = function (id, fields, values) {
    return new Promise((resolve, reject) => {
        var sql = 'UPDATE Users SET '
        fields.forEach(element => {
            sql += element + ' = ? '
        });

        db.query(sql, values, function (error, results, fields) {
            if (error) reject(error);
            console.log(results);
            resolve(results);
        });
    });
};

/**
 * Get a the current user
 * @param {*} req 
 * @param {*} res 
 */
exports.getLoggedInUser = function (req, res) {
    exports.getUserFromId(req.user.id).then(function(user) {
        // Don't send back the hashed password!
        user.password = undefined;
        return res.json({
            'user': user
        });
    }).catch((err) => {
        return res.status(400).json({
            message: err.errmsg
        });
    })
};

/**
 * Delete a the current user
 * @param {*} req 
 * @param {*} res 
 */
exports.deleteLoggedInUser = function (req, res) {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM Users WHERE id = ?;', [req.user.id], function (error, results, fields) {
            if (error) reject(error);
            console.log(results);
            resolve(results);
        });
    })
};