const express = require('express');
const router = express.Router();
const controller = require('../controllers/plot.controller');
const { requireAuth, checkUserOwnership } = require('../function/auth');

// ทุก route ต้อง login ก่อน
// ถ้ามันไม่ได้ไม่ดีก็ลบไปเลยก็ได้ requireAuth , checkUserOwnership
router.get('/', requireAuth, checkUserOwnership, controller.getPlots);
router.post('/', requireAuth, checkUserOwnership, controller.createPlot);
router.put('/:id', requireAuth, controller.updatePlot);
router.delete('/:id', requireAuth, controller.deletePlot);

module.exports = router;
