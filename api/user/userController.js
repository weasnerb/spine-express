'use strict';



/**
 * Get User from their _id
 * @param {} userId 
 */
exports.getUserFromId = function (userId) {
    return new Promise((resolve, reject) => {
        User.findById(userId, function (err, user) {
            if (err) {
                reject(err);
            }
            if (user) {
                if (!user.shoppingList) {
                    user.shoppingList = new ShoppingList();
                }
                if (!user.pantry) {
                    user.pantry = new Pantry();
                }
                resolve(user);
            } else {
                var err = {
                    errmsg: 'User not found.'
                };
                reject(err);
            }
        });
    });
};

/**
 * Get User from their email
 * @param {} userEmail 
 */
exports.getUserFromEmail = function (userEmail) {
    return new Promise((resolve, reject) => {
        User.findOne({
            email: userEmail
        }, function (err, user) {
            if (err) {
                reject(err);
            }
            if (user) {
                if (!user.shoppingList) {
                    user.shoppingList = new ShoppingList();
                }
                if (!user.pantry) {
                    user.pantry = new Pantry();
                }
                resolve(user);
            } else {
                var err = {
                    errmsg: 'User not found.'
                };
                reject(err);
            }
        });
    });
};

/**
 * Save the passed in user
 * @param {*} userToSave 
 */
exports.saveUser = function (userToSave) {
    return new Promise((resolve, reject) => {
        var user = new User(userToSave);
        user.save(function (err, user) {
            if (err) {
                reject(err);
            }
            if (user) {
                resolve(user);
            } else {
                var err = {
                    errmsg: 'User not found.'
                };
                reject(err)
            }
        });
    });
};

/**
 * Get a the current user
 * @param {*} req 
 * @param {*} res 
 */
exports.getLoggedInUser = function (req, res) {
    req.user.hashPassword = undefined;
    return res.json({
        'user': req.user
    });
};

/**
 * Delete a the current user
 * @param {*} req 
 * @param {*} res 
 */
exports.deleteLoggedInUser = function (req, res) {
    User.remove({
        email: req.user.email
    }, function (err, user) {
        if (err) {
            return res.status(400).json({
                message: err.errmsg
            });
        }
        if (!user) {
            res.status(400).json({
                message: 'User not found.'
            });
        } else if (user) {
            user.hashPassword = undefined;
            return res.json({
                'user': user
            });
        }
    });
};