const express = require('express');
const router = express.Router();
const controller = require("../controllers/emailtemplate.controller");

router.get('/', controller.getAllEmailTemplates);
router.get('/:id', controller.getEmailTemplateById);
router.post('/', controller.addEmailTemplate);
router.put('/:id', controller.updateEmailTemplate);
router.delete('/:id', controller.deleteEmailTemplate);

module.exports = router;
