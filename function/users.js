// Middleware สำหรับตรวจสอบ authentication
function requireAuth(req, res, next) {
  try {
    // ตรวจสอบว่ามี session และ userId หรือไม่
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized - Please login first'
      });
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

// Middleware สำหรับตรวจสอบว่าผู้ใช้เป็นเจ้าของ resource หรือไม่
function requireOwnership(req, res, next) {
  try {
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

module.exports = { requireAuth, requireOwnership };
