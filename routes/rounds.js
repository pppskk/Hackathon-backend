const express = require('express');
const router = express.Router();
const controller = require('../controllers/round.controller');
const { requireAuth, checkUserOwnership } = require('../function/auth');

// ทุก route ต้อง login ก่อน
router.get('/', requireAuth, controller.getRounds);
router.post('/', requireAuth, checkUserOwnership, controller.createRound);

module.exports = router;
