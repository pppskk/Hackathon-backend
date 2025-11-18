const express = require('express');
const router = express.Router();
const controller = require('../controllers/plot.controller');
const { requireAuth, checkUserOwnership } = require('../function/auth');

// ทุก route ต้อง login ก่อน
// ถ้ามันไม่ได้ไม่ดีก็ลบไปเลยก็ได้ requireAuth , checkUserOwnership
router.get('/', controller.getPlots);
router.get('/:id', controller.getPlotById);
router.post('/', controller.createPlot);
router.put('/:id', controller.updatePlot);
router.delete('/:id', controller.deletePlot);

module.exports = router;
