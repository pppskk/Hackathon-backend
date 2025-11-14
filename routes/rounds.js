const express = require('express');
const router = express.Router();
const controller = require('../controllers/round.controller');

router.get('/', controller.getRounds);
router.post('/', controller.createRound);

module.exports = router;
