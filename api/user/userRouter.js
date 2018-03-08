const express = require('express'),
    router = express.Router(),
    authController = require('../auth/authController'),
    userController = require('./userController');

router.get('/', authController.loginRequired, userController.getLoggedInUser);

//router.put('/', authController.loginRequired, userController.updateUser);

router.delete('/', authController.loginRequired, userController.deleteLoggedInUser);

router.get('/roles', authController.loginRequired, userController.getUserRoles);

//router.post('/giveRole', authController.roleRequired('admin'), userController.giveRole);

//router.post('/removeRole', authController.roleRequired('admin'), userController.removeRole);

// Need to export the router variable for use in api.js.
module.exports = router;