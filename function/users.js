// Middleware สำหรับตรวจสอบ authentication และ ownership
// ตอนนี้เป็นแบบง่ายๆ สำหรับทดสอบ API โดยไม่ต้องเชื่อม database

// Middleware: ตรวจสอบว่าผู้ใช้ login แล้วหรือยัง
function requireAuth(req, res, next) {
  try {
    // ตรวจสอบว่า req.session มีอยู่หรือไม่
    if (!req.session) {
      console.error('requireAuth: req.session is undefined');
      return res.status(401).json({ message: 'Unauthorized - Session not found' });
    }

    // ตรวจสอบ session หรือ token
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized - Please login first' });
    }

    next();
  } catch (error) {
    console.error('requireAuth error:', error);
    console.error('requireAuth error stack:', error.stack);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
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

