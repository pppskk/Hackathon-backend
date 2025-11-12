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
// GET /listsconst express = require('express');


const router = express.Router();
const Users = require('../../../models/plots');