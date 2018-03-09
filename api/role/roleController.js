'use strict';

const roleModel = require('./roleModel');

/**
 * Get a role by its id
 * @param {*} req 
 * @param {*} res 
 */
exports.getRole = function (req, res) {
    if (!req.params.roleId) {
        return res.status(400).json({
            'success': false,
            'message': 'Valid roleId required.'
        });
    }

    if (req.params.roleId === "all") {
        exports.getAllRoles(req, res);
        return;
    }

    roleModel.getRoleFromId(req.params.roleId).then(function (role) {
        return res.json({
            'success': true,
            'data': {
                'role': role
            }
        });
    }).catch((error) => {
        return res.status(400).json({
            'success': false,
            'message': "Unable to retrieve role with id: " + req.params.roleId
        });
    })
};

/**
 * Get all Roles
 * @param {*} req 
 * @param {*} res 
 */
exports.getAllRoles = function (req, res) {
    roleModel.getAllRoles().then(function (roles) {
        return res.json({
            'success': true,
            'data': {
                'roles': roles
            }
        });
    }).catch((error) => {
        return res.status(400).json({
            'success': false,
            'message': "Unable to retrieve all roles."
        });
    })
}

/**
 * Add a new role
 * @param {*} req 
 * @param {*} res 
 */
exports.addRole = function (req, res) {
    if (!req.body.roleName) {
        return res.status(400).json({
            'success': false,
            'message': 'Valid roleName required.'
        });
    }

    roleModel.saveRole(req.body.roleName).then(function (roleId) {
        return res.json({
            'success': true,
            'data': {
                'roleId': roleId
            }
        });
    }).catch((error) => {
        return res.status(400).json({
            'success': false,
            'message': "Unable to add role."
        });
    })
}

/**
 * Update existing role
 * @param {*} req 
 * @param {*} res 
 */
exports.updateRole = function (req, res) {
    if (!(req.body.roleId && req.body.roleName)) {
        return res.status(400).json({
            'success': false,
            'message': 'Valid roleId and roleName required.'
        });
    }

    roleModel.updateRole(req.body.roleId, ['name'], [req.body.roleName]).then(function (updateInfo) {
        return res.json({
            'success': true,
            'data': {
                'roleId': req.body.roleId
            }
        });
    }).catch((error) => {
        return res.status(400).json({
            'success': false,
            'message': "Unable to update role."
        });
    })
}

/**
 * Delete role by its id
 * @param {*} req 
 * @param {*} res 
 */
exports.deleteRole = function (req, res) {
    if (!req.body.roleId) {
        return res.status(400).json({
            'success': false,
            'message': 'Valid roleId required.'
        });
    }

    roleModel.deleteRoleById(req.body.roleId).then(function (roleId) {
        return res.json({
            'success': true,
            'data': {
                'deletedRoleId': roleId
            }
        });
    }).catch((error) => {
        return res.status(400).json({
            'success': false,
            'message': "Unable to delete role with id: " + req.body.roleId
        });
    })
};

