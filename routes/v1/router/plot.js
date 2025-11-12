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
const Users = require('../../../models/plots');