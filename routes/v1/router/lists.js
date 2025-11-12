// LIST
// POST /lists   สร้างรายการรายรับ - รายจ่าย
// 	RequestBody {
// 		amount : Double
// 		createdAt : DATE
// 		type : String
// 		plotId : String
// }
// GET /lists/:userId ← plot array แสดงข้อมูลทั้งหมดของผู้ใช้ แปลงพืชวอะไรบ้าง รายรับทั้งหมด รายจ่ายทั้งหมด กำไรสุทธิทั้งหมด ยังไงบ้าง
// GET /lists/:plotId ← detail plot array แสดงรายละเอียดใน แปลงพืชรายได้รวมเท่าไหร่ รายจ่ายรวมเท่าไหร่ ข้างในการใช้จ่ายประวัติการใช้จ่าย รายรับรายจ่าย วันที่เท่าไหร่ และ ข้อความหมายเหตุในการ รายรับรายจ่ายนั้น
// GET /lists 


const router = express.Router();
const Users = require('../../../models/plots');