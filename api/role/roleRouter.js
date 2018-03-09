const express = require('express'),
    router = express.Router(),
    authController = require('../auth/authController'),
    roleController = require('./roleController');

router.get('/:roleId(\\d+)', authController.roleRequired('admin'), roleController.getRole);

router.get('/all', authController.roleRequired('admin'), roleController.getAllRoles)

router.post('/', authController.roleRequired('admin'), roleController.addRole);

router.put('/', authController.roleRequired('admin'), roleController.updateRole)

router.delete('/', authController.roleRequired('admin'), roleController.deleteRole);

// Need to export the router variable for use in api.js.
module.exports = router;