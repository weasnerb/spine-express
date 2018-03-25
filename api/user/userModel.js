'use strict';

const db = require('../mySql');

/**
 * Get User from their id
 * @param {number} userId 
 * @param {boolean} [wantPasswordReturned] 
 * @param {boolean} [wantVerifyEmailCodeReturned]
 * @param {boolean} [wantMfaSecret] 
 * @param {boolean} [wantTempMfaSecret]
 */
exports.getUserById = function (userId, wantPasswordReturned, wantVerifyEmailCodeReturned, wantMfaSecret, wantTempMfaSecret) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Users WHERE id = ?', [userId], function (error, results, fields) {
            if (error) {
                reject(error);
            } else {
                if (results.length == 0) {
                    reject();
                    return;
                }
                if (!wantPasswordReturned) {
                    results[0].password = undefined;
                }
                if (!wantVerifyEmailCodeReturned) {
                    results[0].verifyEmailCode = undefined
                }
                if (!wantMfaSecret) {
                    results[0].mfaSecret = undefined;
                }
                if (!wantTempMfaSecret) {
                    results[0].tempMfaSecret = undefined;
                }
                resolve(results[0]);
            }
        });
    });
};

/**
 * Get User by their email
 * @param {string} userEmail 
 * @param {boolean} [wantPasswordReturned]
 * @param {boolean} [wantVerifyEmailCodeReturned]
 * @param {boolean} [wantMfaSecret]
 * @param {boolean} [wantTempMfaSecret]
 */
exports.getUserByEmail = function (userEmail, wantPasswordReturned, wantVerifyEmailCodeReturned, wantMfaSecret, wantTempMfaSecret) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Users WHERE email = ?', [userEmail], function (error, results, fields) {
            if (error) {
                reject(error);
            } else {
                if (results.length == 0) {
                    reject();
                    return;
                }
                if (!wantPasswordReturned) {
                    results[0].password = undefined;
                }
                if (!wantVerifyEmailCodeReturned) {
                    results[0].verifyEmailCode = undefined;
                }
                if (!wantMfaSecret) {
                    results[0].mfaSecret = undefined;
                }
                if (!wantTempMfaSecret) {
                    results[0].tempMfaSecret = undefined;
                }
                resolve(results[0]);
            }
        });
    });
};

/**
 * Get All Users
 */
exports.getAllUsers = function () {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Users', function (error, results, fields) {
            if (error) {
                reject(error);
            } else {
                if (results.length == 0) {
                    reject();
                    return;
                }

                let users = [];
                for (let user of results) {
                    user.password = undefined;
                    user.verifyEmailCode = undefined;
                    user.mfaSecret = undefined;
                    user.tempMfaSecret = undefined;
                    users.push(user);
                }

                resolve(users);
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
        for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
            sql += fields[fieldIndex] + ' = ?'
            if (fieldIndex < fields.length - 1) {
                sql += ",";
            }
            sql += " ";
        }
        sql += 'WHERE `id` = ?'
        values.push(id);

        db.query(sql, values, function (error, results, fields) {
            if (error) {
                reject(error);
            } else {
                if (results.changedRows == 0) {
                    reject();
                } else {
                    resolve(results.changedRows);
                }

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
                if (results.affectedRows == 0) {
                    reject();
                } else {
                    resolve(userId);
                }
            }
        });
    })
};

/**
 * Gets the user's roles
 * @param {number} userId 
 */
exports.getUserRoles = function (userId) {
    return new Promise((resolve, reject) => {
        db.query('Select Roles.name ' +
            'FROM Roles ' +
            'JOIN UsersRolesXRef URXR ON Roles.id = URXR.roleId ' +
            'Where URXR.userId = ?',
            [userId],
            function (error, results, fields) {
                if (error) {
                    reject(error);
                } else {
                    let userRolesArray = [];
                    for (let role of results) {
                        userRolesArray.push(role.name);
                    }
                    resolve(userRolesArray);
                }
            })
    });
}

/**
 * Give role to user
 * @param {number} userId 
 * @param {number} roleId
 */
exports.giveRole = function (userId, roleId) {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO UsersRolesXRef SET userId = ?, roleId = ?;', [userId, roleId], function (error, results, fields) {
            if (error) {
                reject(error);
            } else {
                resolve(results.insertId);
            }
        });
    });
}

/**
 * Remove role from user
 * @param {number} userId 
 * @param {number} roleId
 */
exports.removeRole = function (userId, roleId) {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM UsersRolesXRef WHERE userId = ? AND roleId = ?;', [userId, roleId], function (error, results, fields) {
            if (error) {
                reject(error);
            } else {
                if (results.affectedRows == 0) {
                    reject();
                } else {
                    resolve(userId);
                }
            }
        });
    })
};