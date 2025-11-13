// Middleware สำหรับตรวจสอบ authentication และ ownership
// ตอนนี้เป็นแบบง่ายๆ สำหรับทดสอบ API โดยไม่ต้องเชื่อม database

// Middleware: ตรวจสอบว่าผู้ใช้ login แล้วหรือยัง
function requireAuth(req, res, next) {
  // TODO: เมื่อพร้อมเชื่อม database ให้ uncomment และแก้ไขส่วนนี้
  // ตรวจสอบ session หรือ token
  // if (!req.session.user) {
  //   return res.status(401).json({ message: 'Unauthorized - Please login first' });
  // }
  
  // สำหรับตอนนี้ให้ผ่านไปก่อน (ไม่ต้องเช็ค authentication)
  next();
}

// Middleware: ตรวจสอบว่าผู้ใช้เป็นเจ้าของ resource หรือไม่
function requireOwnership(req, res, next) {
  // TODO: เมื่อพร้อมเชื่อม database ให้ uncomment และแก้ไขส่วนนี้
  // ตรวจสอบว่า user_id ใน request ตรงกับ user ที่ login หรือไม่
  // const userId = req.params.id || req.body.id;
  // if (req.session.user.id !== userId) {
  //   return res.status(403).json({ message: 'Forbidden - You do not have permission' });
  // }
  
  // สำหรับตอนนี้ให้ผ่านไปก่อน (ไม่ต้องเช็ค ownership)
  next();
}

module.exports = { requireAuth, requireOwnership };

