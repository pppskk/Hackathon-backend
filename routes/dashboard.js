const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');

router.get('/summary', controller.getSummary);
router.get('/plots', controller.getPlots);
router.get("/plot-summary", controller.getPlotSummary);
router.get("/plot-expense-detail/:plot_id", controller.getPlotExpenseDetail);

router.get("/expense-by-plant", controller.getExpenseByPlant);
router.get("/income-by-plant", controller.getIncomeByPlant); // เพิ่ม
router.get("/profit-by-plant", controller.getProfitByPlant); // เพิ่ม

module.exports = router;