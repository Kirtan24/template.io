const express = require('express');
const router = express.Router();
const controller = require('../controllers/util.controller');

router.get('/models', controller.getModels);
router.post('/backup', controller.backupDatabase);
router.post('/restore', controller.restoreDatabase);
router.get('/sleep/:time', controller.sleep);
router.get('/server-info', controller.serverInfo);
router.get('/generate-uuid', controller.generateUUID);
router.post('/hash-data', controller.hashData);
router.get('/generate-random', controller.generateRandomNumber);
router.delete('/clear-logs', controller.clearLogs);

module.exports = router;
