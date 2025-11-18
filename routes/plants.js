const express = require('express');
const router = express.Router();
const plantController = require('../controllers/plant.controller');
const { requireAuth, checkUserOwnership } = require('../function/auth');

// ทุก route ต้อง login ก่อน
router.get('/', plantController.getAllPlants);
router.get('/:id', plantController.getPlantById);
router.post('/', plantController.createPlant);
router.put('/:id' ,plantController.updatePlant);
router.delete('/:id' ,plantController.deletePlant);

module.exports = router;
