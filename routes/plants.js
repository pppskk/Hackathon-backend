const express = require('express');
const router = express.Router();
const plantController = require('../controllers/plant.controller');
const { requireAuth, checkUserOwnership } = require('../function/auth');

// ทุก route ต้อง login ก่อน
router.get('/', requireAuth, checkUserOwnership, plantController.getAllPlants);
router.get('/:id', requireAuth, plantController.getPlantById);
router.post('/', requireAuth, checkUserOwnership, plantController.createPlant);
router.put('/:id', requireAuth, plantController.updatePlant);
router.delete('/:id', requireAuth, plantController.deletePlant);

module.exports = router;
