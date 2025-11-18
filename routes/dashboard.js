const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');
const { requireAuth, checkUserOwnership } = require('../function/auth');

// ทุก route ต้อง login ก่อน
router.get('/summary',  controller.getSummary);
router.get('/plots',  controller.getPlots);

module.exports = router;
