// PLOT
// POST /plot  สร้างแปลงพืชใหม่
// RequestBody{
// 	plant_name : String 
// 	plot_name : String
// 	area_size : Double
// 	plant_date : DATE
// 	harvest_date : DATE?
// }
// GET /plot/:userId   แสดงข้อมูลทั้งหมดแปลงพืชนั้นที่มีอยู่ ก็คือรายละเอียดของแปลงพืชที่เราเก็บเอาไวนั้นนะแหละ 

const express = require('express');
const router = express.Router();
const Plots = require('../models/plots');
const Users = require('../models/users');
const Plants = require('../models/plants');

// POST /plot - สร้างแปลงพืชใหม่
router.post('/', async (req, res) => {
    try {
        const { plant_id, plot_name, area_size, user_id } = req.body;

        // Validate required fields ตามโมเดล
        if (!plant_id || !plot_name || !area_size || !user_id) {
            return res.status(400).json({
                status: "error",
                message: "plant_id, plot_name, area_size and user_id are required"
            });
        }

        // Validate area_size (must be positive number)
        const areaSizeNum = parseFloat(area_size);
        if (isNaN(areaSizeNum) || areaSizeNum <= 0) {
            return res.status(400).json({
                status: "error",
                message: "area_size must be a positive number"
            });
        }

        // ตรวจสอบ user และ plant
        const user = await Users.findOne({ where: { user_id } });
        if (!user) return res.status(404).json({ status: "error", message: "User not found" });

        const plant = await Plants.findOne({ where: { plant_id } });
        if (!plant) return res.status(404).json({ status: "error", message: "Plant not found" });

        const newPlot = await Plots.create({
          plant_id,
          plot_name,
          area_size: areaSizeNum,
          user_id
        });

        res.status(201).json({
            status: "success",
            message: "Plot created successfully",
            data: newPlot
        });

    } catch (error) {
        console.error('Create plot error:', error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
});

// GET /plot/:userId - แสดงข้อมูลทั้งหมดแปลงพืชของผู้ใช้
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                status: "error",
                message: "User ID is required"
            });
        }

        // ตรวจสอบ user
        const user = await Users.findOne({ where: { user_id: userId } });
        if (!user) {
          return res.status(404).json({
            status: "error",
            message: "User not found"
          });
        }

        // ดึงข้อมูลแปลงพืชทั้งหมดของผู้ใช้
        const plots = await Plots.findAll({
          where: { user_id: userId }
        });

        // เติมชื่อพืช (ไม่แก้ไฟล์ models จึงไม่ใช้ include)
        const plantIds = [...new Set(plots.map(p => p.plant_id).filter(Boolean))];
        const plants = plantIds.length ? await Plants.findAll({ where: { plant_id: plantIds } }) : [];
        const plantMap = new Map(plants.map(p => [p.plant_id, p.plant_name]));

        const result = plots.map(p => ({
          plot_id: p.plot_id,
          plant_id: p.plant_id,
          plant_name: plantMap.get(p.plant_id) || null,
          plot_name: p.plot_name,
          area_size: p.area_size,
          user_id: p.user_id
        }));

        res.status(200).json({
            status: "success",
            message: "Plots retrieved successfully",
            data: {
                userId: userId,
                plots: result,
                totalPlots: result.length
            }
        });

    } catch (error) {
        console.error('Get plots error:', error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
});

module.exports = router;