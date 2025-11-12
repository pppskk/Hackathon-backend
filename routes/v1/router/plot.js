// PLOT
// POST /plot
// RequestBody{
// 	plant_name : String
// 	plot_name : String
// 	area_size : Double
// 	plant_date : DATE
// 	harvest_date : DATE?
// }
// GET /plot/:userId

const express = require('express');
const router = express.Router();
const Users = require('../../../models/plots');