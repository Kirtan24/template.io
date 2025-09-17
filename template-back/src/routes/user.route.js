const express = require('express');
const router = express.Router();
const controller = require("../controllers/user.controller");

router.get('/', controller.getAllUser);
router.post('/', controller.createUser);
router.delete('/:id', controller.deleteUser);
router.post('/profile', controller.userProfile);
router.post('/update-profile', controller.updateProfile);
router.post('/update-password', controller.updatePassword);
router.get('/dashboard/stats', controller.dashboardState);

module.exports = router;
