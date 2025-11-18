const express = require('express');
const router = express.Router();
const controller = require('../controllers/plot.controller');

router.get("/:plot_id", controller.getPlotById);
router.get('/', controller.getPlots);
router.post('/', controller.createPlot);
router.put('/:id', controller.updatePlot);
router.delete('/:id', controller.deletePlot);
router.get('/:plot_id/expense-summary', controller.getExpenseSummary);
router.get('/:plot_id/expense-breakdown', controller.getExpenseBreakdown);


module.exports = router;
