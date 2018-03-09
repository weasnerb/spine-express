const express = require('express'),
    router = express.Router(),
    authController = require('../auth/authController'),
    userController = require('./userController');

router.get('/', authController.loginRequired, userController.getLoggedInUser);

router.get('/:userId(\\d+)', authController.roleRequired('admin'), userController.getUserById);

router.get('/all', authController.roleRequired('admin'), userController.getAllUsers);

router.put('/', authController.loginRequired, userController.updateUsername);

router.delete('/', authController.loginRequired, userController.deleteLoggedInUser);

router.get('/roles', authController.loginRequired, userController.getUserRoles);

router.post('/role', authController.roleRequired('admin'), userController.giveRole);

router.delete('/role', authController.roleRequired('admin'), userController.removeRole);

// Need to export the router variable for use in api.js.
module.exports = router;