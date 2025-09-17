const express = require('express');
const controller = require('../controllers/permission.controller');

const router = express.Router();

router.get('/', controller.getAllPermissions);
router.get('/:id', controller.getPermissionsById);
router.get('/company/:id', controller.getCompanyPermissions);
router.get('/user/:id', controller.getUserPermissions);
router.put('/:id', controller.updatePermissions);

router.post('/all', controller.CRUDPermission);

module.exports = router;
