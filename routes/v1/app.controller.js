const express = require('express');
const router = express.Router();

router.use('/users', require('./router/users.js'));
router.use('/lists', require('./router/lists.js'));
router.use('/plot', require('./router/plot.js'));

module.exports = router;

// API Documentation:

// USER
// POST /users/login
// RequestBody {
// 	phone_number : String
// }
// Response 200 OK :
// {
//   "status": "success",
//   "message": "OTP has been sent successfully"
// }


// POST /users/otp/checked ← OUTSOURCE API
// GET /users/profile/:userId



// LIST
// POST /lists
// 	RequestBody {
// 		amount : Double
// 		createdAt : DATE
// 		type : String
// 		plotId : String
// }
// GET /lists/:userId ← plot array
// GET /lists/:plotId ← detail plot array
// GET /lists


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
