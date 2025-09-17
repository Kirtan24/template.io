const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const controller = require("../controllers/credential.controller");

const validateCredential = [
  body('name').notEmpty().withMessage('Name is required'),
  body('provider').notEmpty().withMessage('Provider is required'),
  body('host').notEmpty().withMessage('Host is required'),
  body('port').isNumeric().withMessage('Port must be a number'),
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.get('/', controller.getAllCredentials);
router.get('/deleted', controller.getDeletedCredentials);
router.get('/:id', controller.getCredentialById);
router.post('/', validateCredential, controller.addCredential);
router.put('/:id', controller.updateCredential);
router.delete('/:id', controller.deleteCredential);
router.put('/restore/:id', controller.restoreCredential);

module.exports = router;
