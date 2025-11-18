const express = require('express');
const router = express.Router();
const controller = require('../controllers/transaction.controller');
const { requireAuth, checkUserOwnership } = require('../function/auth');

// ทุก route ต้อง login ก่อน
router.get('/',  controller.getTransactions);
router.post('/', controller.createTransaction);

module.exports = router;
