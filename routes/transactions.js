const express = require('express');
const router = express.Router();
const controller = require('../controllers/transaction.controller');

router.get('/categories', controller.getCategories); // เพิ่มเส้นนี้
router.get('/', controller.getTransactions);
router.post('/', controller.createTransaction);

module.exports = router;
