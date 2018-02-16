'use strict';

const db = require('../mySql');

/**
 * Get User from their id
 * @param {number} userId 
 * @param {boolean} [wantPasswordReturned] 
 * @param {boolean} [wantVerifyEmailCodeReturned]
 */
exports.getUserFromId = function (userId, wantPasswordReturned, wantVerifyEmailCodeReturned) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Users WHERE id = ?', [userId], function (error, results, fields) {
            if (error) {
                reject(error);
            } else {
                if (!wantPasswordReturned) {
                    results[0].password = undefined;
                }
                if (!wantVerifyEmailCodeReturned) {
                    results[0].verifyEmailCode = undefined
                }
                resolve(results[0]);
            }
        });
    });
};

/**
 * 
 * @param {number} userId 
 */
exports.getUserGroups = function (userId) {
    return new Promise((resolve, reject) => {
        db.query('Select ')
    });
}

/**
 * Get User by their email
 * @param {string} userEmail 
 * @param {boolean} [wantPasswordReturned]
 * @param {boolean} [wantVerifyEmailCodeReturned]
 */
exports.getUserFromEmail = function (userEmail, wantPasswordReturned, wantVerifyEmailCodeReturned) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Users WHERE email = ?', [userEmail], function (error, results, fields) {
            if (error) {
                reject(error);
            } else {
                if (!wantPasswordReturned) {
                    results[0].password = undefined;
                }
                if (!wantVerifyEmailCodeReturned) {
                    results[0].verifyEmailCode = undefined
                }
                resolve(results[0]);
            }
        });
    });
};

/**
 * Save new User in Database
 * @param {string} username 
 * @param {string} email 
 * @param {string} password 
 */
exports.saveUser = function (username, email, password, verifyEmailCode) {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO Users SET username = ?, email = ?, password = ?, verifyEmailCode = ?', [username, email, password, verifyEmailCode], function (error, results, fields) {
            if (error) {
                reject(error);
            } else {
                resolve(results.insertId);
            }
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
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
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
            if (error) {
                reject(error);
            } else {
                resolve(userId);
            }
        });
    })
};