'use strict';

var bcrypt = require('bcrypt');

/**
 * Compares the passed in password with the user's hashed password
 * @param password
 */
// exports.comparePassword = function (password) {
//     return bcrypt.compareSync(password, this.hashPassword);
// };