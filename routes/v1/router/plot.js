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
const Plots = require('../../../models/plots');
const Users = require('../../../models/users');

// POST /plot - สร้างแปลงพืชใหม่
router.post('/', async (req, res) => {
    try {
        const { plant_name, plot_name, area_size, plant_date, harvest_date, userId } = req.body;

        // Validate required fields
        if (!plant_name || !plot_name || !area_size || !plant_date) {
            return res.status(400).json({
                status: "error",
                message: "plant_name, plot_name, area_size, and plant_date are required"
            });
        }

        // Validate userId (required for associating plot with user)
        if (!userId) {
            return res.status(400).json({
                status: "error",
                message: "userId is required"
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

        // Validate plant_date format
        const plantDate = new Date(plant_date);
        if (isNaN(plantDate.getTime())) {
            return res.status(400).json({
                status: "error",
                message: "Invalid plant_date format"
            });
        }

        // Validate harvest_date if provided (must be after plant_date)
        if (harvest_date) {
            const harvestDate = new Date(harvest_date);
            if (isNaN(harvestDate.getTime())) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid harvest_date format"
                });
            }
            if (harvestDate < plantDate) {
                return res.status(400).json({
                    status: "error",
                    message: "harvest_date must be after plant_date"
                });
            }
        }

        // TODO: ตรวจสอบว่ามี user นี้อยู่จริงหรือไม่
        // const user = await Users.findOne({
        //   where: { user_id: userId }
        // });
        // if (!user) {
        //   return res.status(404).json({
        //     status: "error",
        //     message: "User not found"
        //   });
        // }

        // TODO: สร้างแปลงพืชใหม่ใน database
        // const newPlot = await Plots.create({
        //   plant_name: plant_name,
        //   plot_name: plot_name,
        //   area_size: areaSizeNum,
        //   plant_date: plantDate,
        //   harvest_date: harvest_date ? new Date(harvest_date) : null,
        //   user_id: userId
        // });

        // Mock response
        const mockPlot = {
            plot_id: Math.floor(Math.random() * 1000),
            plant_name: plant_name,
            plot_name: plot_name,
            area_size: areaSizeNum,
            plant_date: plantDate.toISOString(),
            harvest_date: harvest_date ? new Date(harvest_date).toISOString() : null,
            user_id: userId,
            createdAt: new Date().toISOString()
        };

        res.status(201).json({
            status: "success",
            message: "Plot created successfully",
            data: mockPlot
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

        // TODO: ตรวจสอบว่ามี user นี้อยู่จริงหรือไม่
        // const user = await Users.findOne({
        //   where: { user_id: userId }
        // });
        // if (!user) {
        //   return res.status(404).json({
        //     status: "error",
        //     message: "User not found"
        //   });
        // }

        // TODO: ดึงข้อมูลแปลงพืชทั้งหมดของผู้ใช้
        // const plots = await Plots.findAll({
        //   where: { user_id: userId },
        //   order: [['createdAt', 'DESC']]
        // });

        // Mock data สำหรับทดสอบ logic
        const mockPlots = [
            {
                plot_id: 1,
                plant_name: "ข้าวโพด",
                plot_name: "ข้าวโพดหลังบ้าน",
                area_size: 5.0,
                plant_date: "2025-01-01T00:00:00.000Z",
                harvest_date: null,
                user_id: userId
            },
            {
                plot_id: 2,
                plant_name: "ข้าวหอมมะลิ",
                plot_name: "ข้าวหอมมะลิ",
                area_size: 12.0,
                plant_date: "2025-10-10T00:00:00.000Z",
                harvest_date: "2025-11-25T00:00:00.000Z",
                user_id: userId
            },
            {
                plot_id: 3,
                plant_name: "ขิง",
                plot_name: "ขิงแปลงใหญ่",
                area_size: 8.0,
                plant_date: "2025-09-15T00:00:00.000Z",
                harvest_date: null,
                user_id: userId
            },
            {
                plot_id: 4,
                plant_name: "พริก",
                plot_name: "พริกข้างเทศบาล",
                area_size: 3.0,
                plant_date: "2025-08-20T00:00:00.000Z",
                harvest_date: null,
                user_id: userId
            }
        ];

        res.status(200).json({
            status: "success",
            message: "Plots retrieved successfully",
            data: {
                userId: userId,
                plots: mockPlots,
                totalPlots: mockPlots.length
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