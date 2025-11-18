const express = require('express');
const router = express.Router();
const controller = require('../controllers/category.controller');
const { requireAuth } = require('../function/auth');

// ทุก route ต้อง login ก่อน
router.get('/types',  controller.getTypes);
router.get('/',  controller.getCategories);
router.get('/expense',  controller.getExpenseCategories);
router.get('/income',  controller.getIncomeCategories);

module.exports = router;
