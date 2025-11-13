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
// GET /users/profile/:userId    --> ข้อมูลผู้ใช้งานจาก id นั้น ชื่อ นามสกุล เบอร์โทร 
// PUT /users/profile/:userId    --> อัพเดทข้อมูลผู้ใช้งานจาก id นั้น ชื่อ นามสกุล เบอร์โทร 

const express = require('express');
const router = express.Router();
const Users = require('../models/users');
const { requireAuth, requireOwnership } = require('../function/users');

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, phone, userPicture } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "phone is required" });
    }

    const phoneRegex = /^0[6-9]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    const exists = await Users.findOne({ where: { phone } });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const result = await Users.create({ firstName: firstName || null, lastName: lastName || null, phone, userPicture: userPicture || null });
    if (!result) {
      return res.status(400).json({ message: "User registration failed" });
    }

    req.session.user = { user_id: result.user_id, phone: result.phone };

    res.status(200).json({ message: "User registered successfully", data: { user_id: result.user_id, firstName: result.firstName, lastName: result.lastName, phone: result.phone, userPicture: result.userPicture } });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update", requireAuth, async (req, res) => {
  try {
    const { user_id, firstName, lastName, phone, userPicture } = req.body;

    if (!user_id) return res.status(400).json({ message: "user_id is required" });
    if (!firstName && !lastName && !phone && !userPicture) return res.status(400).json({ message: "No fields to update" });

    const userQuery = await Users.findOne({ where: { user_id } });
    if (!userQuery) {
      return res.status(404).json({ message: "User not found" });
    }

    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (phone !== undefined) {
      const phoneRegex = /^0[6-9]\d{8}$/;
      if (!phoneRegex.test(phone)) return res.status(400).json({ message: "Invalid phone number format" });
      updates.phone = phone;
    }
    if (userPicture !== undefined) updates.userPicture = userPicture;

    const [count] = await Users.update(updates, { where: { user_id } });
    if (count === 0) {
      return res.status(400).json({ message: "User update failed" });
    }

    const updated = await Users.findOne({ where: { user_id }, attributes: ['user_id', 'firstName', 'lastName', 'phone', 'userPicture'] });

    return res.status(200).json({ message: "User updated successfully", data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /users/login - ส่ง OTP ไปยังเบอร์โทรศัพท์ (ตาม comment)
router.post('/login', async (req, res) => {
  try {
    const { phone_number } = req.body;

    // Validate input
    if (!phone_number) {
      return res.status(400).json({
        status: "error",
        message: "Phone number is required"
      });
    }

    // Validate phone number format (Thai phone number)
    const phoneRegex = /^0[6-9]\d{8}$/;
    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid phone number format"
      });
    }

    // TODO: เชื่อมต่อกับ OTP service เพื่อส่ง OTP
    // const otpCode = generateOTP(); // สร้าง OTP
    // await sendOTP(phone_number, otpCode); // ส่ง OTP ไปยังเบอร์โทร

    // TODO: เก็บ OTP และ phone_number ไว้ใน session หรือ cache พร้อม expiration time
    // req.session.otp = {
    //   phone_number: phone_number,
    //   code: otpCode,
    //   expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    // };

    // Response success
    res.status(200).json({
      status: "success",
      message: "OTP has been sent successfully"
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
});

router.post('/logout', requireAuth, async (req, res) => {
  try {
    req.session.destroy(err => {
      if (err) {
        console.error('Logout:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      res.status(200).json({ message: 'Logout successful' });
    });

  } catch (err) {
    console.error('Logout Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }

});

router.get('/check', requireAuth, (req, res) => {
  try {
    return res.status(200).json({
      message: 'Authenticated',
      user: {
        user_id: req.session.user.user_id,
        phone: req.session.user.phone,
      }
    });
  } catch (err) {
    console.error('Authenticated:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', requireAuth, requireOwnership, async (req, res) => {
  const userId = req.params.id;

  try {
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const userData = await Users.findOne({
      where: { user_id: userId },
      attributes: ['user_id', 'firstName', 'lastName', 'phone', 'userPicture']
    });

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile",
      user: userData
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete('/delete/:id', requireOwnership, async (req, res) => {
  try {
    const userId = req.params.id;

    const deleteQuery = await Users.destroy({
      where: { user_id: userId }
    });

    if (!deleteQuery) {
      return res.status(400).json({ message: "User deletion failed" });
    }

    req.session.destroy(err => {
      if (err) {
        console.error('Logout:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
    });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// หมายเหตุ: ตัด endpoint ฝาก/ถอน ที่อิง field money ออก เพราะไม่มีในโมเดล

// GET /users/profile/:userId - ดึงข้อมูลผู้ใช้งาน
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required"
      });
    }

    const userData = await Users.findOne({
      where: { user_id: userId },
      attributes: ['user_id', 'firstName', 'lastName', 'phone', 'userPicture']
    });

    if (!userData) {
      return res.status(404).json({
        status: "error",
        message: "User not found"
      });
    }

    res.status(200).json({
      status: "success",
      message: "User profile retrieved successfully",
      data: userData
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
});

// PUT /users/profile/:userId - อัพเดทข้อมูลผู้ใช้งาน
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, phone, userPicture } = req.body;

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required"
      });
    }

    // Validate input - ต้องมีอย่างน้อย 1 field ที่จะอัพเดท
    if (!firstName && !lastName && !phone && !userPicture) {
      return res.status(400).json({
        status: "error",
        message: "At least one field is required to update"
      });
    }

    // Validate phone number format if provided
    if (phone) {
      const phoneRegex = /^0[6-9]\d{8}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid phone number format"
        });
      }
    }

    // ตรวจสอบว่ามี user นี้อยู่จริงหรือไม่
    const existingUser = await Users.findOne({
      where: { user_id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found"
      });
    }

    // ตรวจสอบว่าเบอร์โทรซ้ำกับ user อื่นหรือไม่ (ถ้ามีการเปลี่ยนเบอร์)
    if (phone && phone !== existingUser.phone) {
      const phoneExists = await Users.findOne({
        where: { phone: phone }
      });
      if (phoneExists) {
        return res.status(400).json({
          status: "error",
          message: "Phone number already exists"
        });
      }
    }

    // อัพเดทข้อมูลใน database
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (userPicture !== undefined) updateData.userPicture = userPicture;

    await Users.update(updateData, {
      where: { user_id: userId }
    });

    // ดึงข้อมูลที่อัพเดทแล้ว
    const updatedUser = await Users.findOne({
      where: { user_id: userId },
      attributes: ['user_id', 'firstName', 'lastName', 'phone', 'userPicture']
    });

    res.status(200).json({
      status: "success",
      message: "User profile updated successfully",
      data: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
});



module.exports = router;