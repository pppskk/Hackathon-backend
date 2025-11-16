const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');
const { requireAuth, checkUserOwnership } = require('../function/auth');

// ทุก route ต้อง login ก่อน
router.get('/summary', requireAuth, checkUserOwnership, controller.getSummary);
router.get('/plots', requireAuth, checkUserOwnership, controller.getPlots);

module.exports = router;
