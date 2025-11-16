const  Plant  = require('../models/plants');


exports.getAllPlants = async (req, res) => {
  try {
    const { user_id } = req.query; // ใช้ query จาก frontend เช่น /api/plants?user_id=1
    const plants = await Plant.findAll({ where: { user_id } });
    res.json(plants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getPlantById = async (req, res) => {
  try {
    const { id } = req.params;
    const sessionUserId = req.session.userId;
    
    const plant = await Plant.findByPk(id);
    if (!plant) return res.status(404).json({ error: 'Plant not found' });
    
    // เช็คว่าเป็นของ user นี้หรือไม่
    if (plant.user_id !== sessionUserId) {
      return res.status(403).json({ 
        status: 'error',
        message: 'Forbidden - You can only access your own plants' 
      });
    }
    
    res.json(plant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.createPlant = async (req, res) => {
  try {
    const { user_id, plant_name } = req.body;
    const newPlant = await Plant.create({ user_id, plant_name });
    console.log("Plant model =", Plant);
    res.status(201).json(newPlant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.updatePlant = async (req, res) => {
  try {
    const { id } = req.params;
    const { plant_name } = req.body;
    const sessionUserId = req.session.userId;
    
    const plant = await Plant.findByPk(id);
    if (!plant) return res.status(404).json({ error: 'Plant not found' });
    
    // เช็คว่าเป็นของ user นี้หรือไม่
    if (plant.user_id !== sessionUserId) {
      return res.status(403).json({ 
        status: 'error',
        message: 'Forbidden - You can only update your own plants' 
      });
    }
    
    plant.plant_name = plant_name;
    await plant.save();
    res.json(plant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.deletePlant = async (req, res) => {
  try {
    const { id } = req.params;
    const sessionUserId = req.session.userId;
    
    const plant = await Plant.findByPk(id);
    if (!plant) return res.status(404).json({ error: 'Plant not found' });
    
    // เช็คว่าเป็นของ user นี้หรือไม่
    if (plant.user_id !== sessionUserId) {
      return res.status(403).json({ 
        status: 'error',
        message: 'Forbidden - You can only delete your own plants' 
      });
    }
    
    await plant.destroy();
    res.json({ message: 'Plant deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
