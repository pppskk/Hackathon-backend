// Middleware สำหรับตรวจสอบ authentication
function requireAuth(req, res, next) {
  try {
    // สำหรับ mobile app ที่ไม่มี session ให้ skip การตรวจสอบ
    if (!req.session || !req.session.userId) {
      // ถ้าไม่มี session ให้ผ่านไปเลย (สำหรับ mobile)
      return next();
    }

    // ตรวจสอบว่า session ยังไม่หมดอายุ
    if (req.session.cookie && req.session.cookie.expires) {
      const now = new Date();
      const expires = new Date(req.session.cookie.expires);
      if (now > expires) {
        req.session.destroy();
        return res.status(401).json({ 
          status: 'error',
          message: 'Session expired - Please login again' 
        });
      }
    }

    next();
  } catch (error) {
    console.error('requireAuth error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}

// Middleware สำหรับตรวจสอบว่า user_id ใน request ตรงกับ session หรือไม่
function checkUserOwnership(req, res, next) {
  try {
    // สำหรับ mobile app ที่ไม่มี session ให้ skip การตรวจสอบ
    if (!req.session || !req.session.userId) {
      // ถ้าไม่มี session ให้ผ่านไปเลย (สำหรับ mobile)
      return next();
    }

    const sessionUserId = req.session.userId;
    
    // เช็ค user_id จาก body, query, หรือ params
    const requestUserId = req.body.user_id || req.query.user_id || req.params.user_id;

    if (!requestUserId) {
      return res.status(400).json({ 
        status: 'error',
        message: 'user_id is required' 
      });
    }

    // ตรวจสอบว่า user_id ตรงกับ session หรือไม่
    if (parseInt(requestUserId) !== sessionUserId) {
      return res.status(403).json({ 
        status: 'error',
        message: 'Forbidden - You can only access your own data' 
      });
    }

    next();
  } catch (error) {
    console.error('checkUserOwnership error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}

// Middleware สำหรับตรวจสอบว่า resource เป็นของ user หรือไม่ (สำหรับ update/delete)
function requireOwnership(req, res, next) {
  try {
    // สำหรับ mobile app ที่ไม่มี session ให้ skip การตรวจสอบ
    if (!req.session || !req.session.userId) {
      // ถ้าไม่มี session ให้ผ่านไปเลย (สำหรับ mobile)
      return next();
    }

    const resourceId = req.params.id || req.params.userId;
    const requesterId = req.session.userId;

    if (!resourceId) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Resource ID is required' 
      });
    }

    // ตรวจสอบว่า user ที่ request เป็นเจ้าของ resource หรือไม่
    if (parseInt(resourceId) !== requesterId) {
      return res.status(403).json({ 
        status: 'error',
        message: 'Forbidden - You do not have permission to access this resource' 
      });
    }

    next();
  } catch (error) {
    console.error('requireOwnership error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}

module.exports = { 
  requireAuth, 
  checkUserOwnership,
  requireOwnership 
};
