const express = require('express');
const router = express.Router();
const controller = require('../controllers/category.controller');
const { requireAuth } = require('../function/auth');

// ทุก route ต้อง login ก่อน
router.get('/types', requireAuth, controller.getTypes);
router.get('/', requireAuth, controller.getCategories);
router.get('/expense', requireAuth, controller.getExpenseCategories);
router.get('/income', requireAuth, controller.getIncomeCategories);

module.exports = router;
