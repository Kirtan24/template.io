const express = require('express');
const controller = require('../controllers/template.controller');
const sendController = require('../controllers/send.controller');
const { singleUpload, anyUpload } = require('../middlewares/multer.middleware');

const router = express.Router();

router.post('/', controller.getAllTemplates);
router.get('/:id', controller.getTemplateById);
router.post('/upload', singleUpload, controller.uploadTemplate);
router.post('/finalsave', singleUpload, controller.addTemplate);
router.put('/:id', controller.updateTemplate);
router.patch('/:id', controller.updateTemplateStatus);
router.delete('/:id', controller.deleteTemplate);
router.delete('/cancelProcess/:filename', controller.deleteFileFromCloudinary);
router.post('/generate-docx', anyUpload, sendController.processTemplate);
router.post('/bulk-generate', anyUpload, sendController.createJob);

module.exports = router;
