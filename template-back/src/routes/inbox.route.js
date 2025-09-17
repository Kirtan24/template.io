const express = require('express');
const router = express.Router();
const controller = require("../controllers/inbox.controller");
const sendController = require("../controllers/send.controller");
const { upload } = require("../controllers/inbox.controller");
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, controller.getAllMails);
router.get('/:id', authMiddleware, controller.getMailById);
router.delete('/:id', authMiddleware, controller.deleteInbox);
router.post('/send', authMiddleware, controller.sendMail);
router.post('/scheduleMail', authMiddleware, controller.scheduleMail);
router.post('/upload-signature', upload.single('signature'), sendController.uploadSignature);
router.post('/verify-token', controller.validateToken);

module.exports = router;
