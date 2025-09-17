const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const permissionController = require('../controllers/permission.controller');

router.get('/', companyController.getAllCompanies);
router.get('/count', companyController.inactiveCompany);
router.get('/:id', companyController.getCompanyById);
router.delete('/:id', companyController.deleteCompany);
router.get('/employees/:id', companyController.companyEmployees);
router.get('/profile/:id', companyController.companyProfile);

router.patch('/approve/:companyId', companyController.approveCompany);
router.patch('/reject/:companyId', companyController.rejectCompany);

module.exports = router;
