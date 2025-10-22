// routes/adminRoutes.js
const express = require('express');
const adminRouter = express.Router();
const { verifyAdminLogin } = require('../controllers/admin.controller');

adminRouter.post('/verify-admin', verifyAdminLogin);

module.exports = adminRouter;
