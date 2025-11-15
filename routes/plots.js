const express = require('express');
const router = express.Router();
const controller = require('../controllers/plot.controller');

router.get('/', controller.getPlots);
router.post('/', controller.createPlot);
router.put('/:id', controller.updatePlot);
router.delete('/:id', controller.deletePlot);

module.exports = router;
