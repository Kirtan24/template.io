const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.route');
const userRoutes = require('./user.route');
const utilRoutes = require('./util.route');
const planRoutes = require('./plan.route');
const inboxRoutes = require('./inbox.route');
const generalRoutes = require('./general.route');
const companyRoutes = require('./company.route');
const templateRoutes = require('./template.route');
const credentialRoutes = require('./credential.route');
const permissionRoutes = require('./permission.route');
const emailtemplateRoutes = require('./emailtemplate.route');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.use('/auth', authRoutes);
router.use('/plans', planRoutes);
router.use('/general', generalRoutes);

// Protected routes
router.use('/inbox', inboxRoutes);
router.use('/user', authMiddleware, userRoutes);
router.use('/util', authMiddleware, utilRoutes);
router.use('/templates', authMiddleware, templateRoutes);
router.use('/companies', authMiddleware, companyRoutes);
router.use('/permissions', authMiddleware, permissionRoutes);
router.use('/credentials', authMiddleware, credentialRoutes);
router.use('/email-template', authMiddleware, emailtemplateRoutes);

module.exports = router;
