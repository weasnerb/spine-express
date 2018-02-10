'use strict';

const db = require('../mySql');

/**
 * Get User from their id
 * @param {number} userId 
 * @param {boolean} [wantPasswordReturned] 
 */
exports.getUserFromId = function (userId, wantPasswordReturned) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Users WHERE id = ?', [userId], function (error, results, fields) {
            if (error) reject(error);
            if (!wantPasswordReturned) {
                results[0].password = undefined;
            }
            resolve(results[0]);
        });
    });
};

/**
 * Get User by their email
 * @param {string} userEmail 
 * @param {boolean} [wantPasswordReturned] 
 */
exports.getUserFromEmail = function (userEmail, wantPasswordReturned) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Users WHERE email = ?', [userEmail], function (error, results, fields) {
            if (error) reject(error);
            if (!wantPasswordReturned) {
                results[0].password = undefined;
            }
            resolve(results[0]);
        });
    });
};

/**
 * Save new User in Database
 * @param {string} username 
 * @param {string} email 
 * @param {string} password 
 */
exports.saveUser = function (username, email, password) {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO Users SET username = ?, email = ?, password = ?', [username, email, password], function (error, results, fields) {
            if (error) reject(error);
            resolve(results.insertId);
        });
    });
}

/**
 * Update fields of user with passed in id
 * @param {number} id 
 * @param {string[]} fields 
 * @param {string[]} values 
 */
exports.updateUser = function (id, fields, values) {
    return new Promise((resolve, reject) => {
        if (fields.length != values.length) {
            reject("Number of fields and values do not match.")
        }
        var sql = 'UPDATE Users SET '
        fields.forEach(element => {
            sql += element + ' = ? '
        });

        db.query(sql, values, function (error, results, fields) {
            if (error) reject(error);
            resolve(results);
        });
    });
};

/**
 * Delete user with passed in id
 * @param {number} userId 
 */
exports.deleteUser = function (userId) {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM Users WHERE id = ?;', userId, function (error, results, fields) {
            if (error) reject(error);
            resolve(userId);
        });
    })
};