const Users = require('../models/users');

// Register new user
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, phone, userPicture } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Phone number is required' 
      });
    }

    const phoneRegex = /^0[6-9]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid phone number format. Must be 10 digits starting with 06-09' 
      });
    }

    const existingUser = await Users.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Phone number already registered' 
      });
    }

    const newUser = await Users.create({ 
      firstName: firstName || null, 
      lastName: lastName || null, 
      phone, 
      userPicture: userPicture || null 
    });

    // สร้าง session หลัง register สำเร็จ
    req.session.userId = newUser.user_id;
    req.session.phone = newUser.phone;

    res.status(201).json({ 
      status: 'success',
      message: 'User registered successfully', 
      data: { 
        user_id: newUser.user_id, 
        firstName: newUser.firstName, 
        lastName: newUser.lastName, 
        phone: newUser.phone, 
        userPicture: newUser.userPicture 
      } 
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Internal server error' 
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { phone_number, phone } = req.body;
    const phoneNumber = phone_number || phone;

    if (!phoneNumber) {
      return res.status(400).json({
        status: 'error',
        message: 'Phone number is required'
      });
    }

    const phoneRegex = /^0[6-9]\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid phone number format'
      });
    }

    const user = await Users.findOne({ where: { phone: phoneNumber } });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found. Please register first.'
      });
    }

    // TODO: Implement OTP verification here
    // For now, we'll create session directly

    // สร้าง session ใหม่และเก็บข้อมูล user
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regenerate error:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to create session'
        });
      }

      req.session.userId = user.user_id;
      req.session.phone = user.phone;

      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({
            status: 'error',
            message: 'Failed to save session'
          });
        }

        res.status(200).json({
          status: 'success',
          message: 'Login successful',
          data: {
            user_id: user.user_id,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            userPicture: user.userPicture
          }
        });
      });
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ 
          status: 'error',
          message: 'Failed to logout' 
        });
      }

      res.clearCookie('sessionId');
      res.status(200).json({ 
        status: 'success',
        message: 'Logout successful' 
      });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Internal server error' 
    });
  }
};

// Check authentication status
exports.checkAuth = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Not authenticated' 
      });
    }

    const user = await Users.findOne({
      where: { user_id: userId },
      attributes: ['user_id', 'firstName', 'lastName', 'phone', 'userPicture']
    });

    if (!user) {
      req.session.destroy();
      return res.status(401).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Authenticated',
      data: user
    });
  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get user profile by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.session.userId;

    // ตรวจสอบว่า user ที่ request เป็นเจ้าของข้อมูลหรือไม่
    if (parseInt(id) !== requesterId) {
      return res.status(403).json({ 
        status: 'error',
        message: 'Forbidden - You can only access your own profile' 
      });
    }

    const user = await Users.findOne({
      where: { user_id: id },
      attributes: ['user_id', 'firstName', 'lastName', 'phone', 'userPicture']
    });

    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User profile retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Internal server error' 
    });
  }
};

// Update user profile
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.session.userId;
    const { firstName, lastName, phone, userPicture } = req.body;

    // ตรวจสอบว่า user ที่ request เป็นเจ้าของข้อมูลหรือไม่
    if (parseInt(id) !== requesterId) {
      return res.status(403).json({ 
        status: 'error',
        message: 'Forbidden - You can only update your own profile' 
      });
    }

    if (!firstName && !lastName && !phone && !userPicture) {
      return res.status(400).json({ 
        status: 'error',
        message: 'At least one field is required to update' 
      });
    }

    const user = await Users.findOne({ where: { user_id: id } });
    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }

    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (userPicture !== undefined) updates.userPicture = userPicture;

    if (phone !== undefined) {
      const phoneRegex = /^0[6-9]\d{8}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Invalid phone number format' 
        });
      }

      // ตรวจสอบว่าเบอร์โทรซ้ำกับ user อื่นหรือไม่
      if (phone !== user.phone) {
        const phoneExists = await Users.findOne({ where: { phone } });
        if (phoneExists) {
          return res.status(400).json({ 
            status: 'error',
            message: 'Phone number already exists' 
          });
        }
      }
      updates.phone = phone;
    }

    await Users.update(updates, { where: { user_id: id } });

    const updatedUser = await Users.findOne({
      where: { user_id: id },
      attributes: ['user_id', 'firstName', 'lastName', 'phone', 'userPicture']
    });

    // อัพเดท session ถ้ามีการเปลี่ยนเบอร์โทร
    if (phone && phone !== user.phone) {
      req.session.phone = phone;
    }

    res.status(200).json({
      status: 'success',
      message: 'User profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Internal server error' 
    });
  }
};

// Delete user account
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.session.userId;

    // ตรวจสอบว่า user ที่ request เป็นเจ้าของข้อมูลหรือไม่
    if (parseInt(id) !== requesterId) {
      return res.status(403).json({ 
        status: 'error',
        message: 'Forbidden - You can only delete your own account' 
      });
    }

    const user = await Users.findOne({ where: { user_id: id } });
    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }

    await Users.destroy({ where: { user_id: id } });

    // ลบ session หลังจากลบ account
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
    });

    res.status(200).json({ 
      status: 'success',
      message: 'User account deleted successfully' 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Internal server error' 
    });
  }
};
