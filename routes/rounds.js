const express = require('express');
const router = express.Router();
const controller = require('../controllers/round.controller');
const { requireAuth, checkUserOwnership } = require('../function/auth');

// ทุก route ต้อง login ก่อน
router.get('/',  controller.getRounds);
router.post('/', controller.createRound);

module.exports = router;
