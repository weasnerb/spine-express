'use strict';
// Yes, I literally named this file roleModel :)
const db = require('../mySql');

/**
 * Get role from their id
 * @param {number} roleId 
 */
exports.getRoleFromId = function (roleId) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Roles WHERE id = ?', [roleId], function (error, results, fields) {
            if (error) {
                reject(error);
            } else {
                if (results.length == 0) {
                    reject();
                    return;
                }
                resolve(results[0]);
            }
        });
    });
};

/**
 * Save new Role in Database
 * @param {string} nameOfNewRole
 */
exports.saveRole = function (nameOfNewRole) {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO Roles SET name = ?', [nameOfNewRole], function (error, results, fields) {
            if (error) {
                reject(error);
            } else {
                resolve(results.insertId);
            }
        });
    });
}

/**
 * Update fields of role with passed in id
 * @param {number} id 
 * @param {string[]} fields 
 * @param {string[]} values 
 */
exports.updateRole = function (id, fields, values) {
    return new Promise((resolve, reject) => {
        if (fields.length != values.length) {
            reject("Number of fields and values do not match.")
        }
        var sql = 'UPDATE Roles SET '
        fields.forEach(element => {
            sql += "`" + element + '` = ? '
        });
        sql += 'WHERE `id` = ?'
        values.push(id);

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
 * Delete Role with passed in id
 * @param {number} roleId 
 */
exports.deleteRoleById = function (roleId) {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM Roles WHERE id = ?;', roleId, function (error, results, fields) {
            if (error) {
                reject(error);
            } else {
                resolve(roleId);
            }
        });
    })
};