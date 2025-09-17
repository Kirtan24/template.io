const express = require('express');
const router = express.Router();
const controller = require('../controllers/plan.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer();

router.get('/', controller.getAllPlans);
router.get('/:id', authMiddleware, controller.getPlanById);
router.post('/', upload.none(), authMiddleware, controller.updatePlan);

module.exports = router;
