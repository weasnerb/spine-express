'use strict';

var db = require('../mySql');

/**
 * Get User from their _id
 * @param {} userId 
 */
exports.getUserFromId = function (userId) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE id = ?', [userId], function (error, results, fields) {
            if (error) reject(err);
            console.log(results);
            resolve(results);
        });
    });
};

/**
 * Get User from their email
 * @param {} userEmail 
 */
exports.getUserFromEmail = function (userEmail) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE email = ?', [userEmail], function (error, results, fields) {
            if (error) reject(err);
            console.log(results);
            resolve(results);
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
        db.connect();
        db.query('INSERT INTO Users SET username = ?, email = ?, password = ?', [username, email, password], function (error, results, fields) {
            if (error) reject(err);
            console.log('success');
            console.log(results);
            resolve(results);
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
            if (error) reject(err);
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
    return getUserFromId(req.user.id)
};

/**
 * Delete a the current user
 * @param {*} req 
 * @param {*} res 
 */
exports.deleteLoggedInUser = function (req, res) {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM Users WHERE id = ?;', [req.user.id], function (error, results, fields) {
            if (error) reject(err);
            console.log(results);
            resolve(results);
        });
    })
};