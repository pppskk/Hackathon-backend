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
const Users = require('../../../models/users');
const { requireAuth, requireOwnership } = require('../../../function/users');

router.post("/register", async (req, res) => {
  const { fName, lName, email, password, tel, birthday } = req.body;

  try {
    if (!fName || !lName || !tel || !email || !password || !birthday) return res.status(400).json({ message: "No fields to register" });

    if (!validateBirthday(birthday)) return res.status(400).json({ message: "Invalid birthday" });
    const selectQuery = await Users.findOne({ where: { email } });
    if (selectQuery) {
      return res.status(400).json({ message: "User already exists" });
    }

    const result = await Users.create({ firstName: fName, lastName: lName, email, password, tel, birthday });
    if (!result) {
      return res.status(400).json({ message: "User registration failed" });
    }

    req.session.user = {
      email: email,
    }

    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update", requireAuth, async (req, res) => {
  const { id, fName, lName, email, password, tel } = req.body;

  try {
    if (!fName && !lName && !tel && !email && !password) return res.status(400).json({ message: "No fields to update" });

    const userQuery = await Users.findOne({ where: { id: id } });
    if (!userQuery) {
      return res.status(400).json({ message: "User not found" });
    }

    let NewFName = userQuery.firstName;
    let NewLName = userQuery.lastName;
    let NewTel = userQuery.tel;
    let NewEmail = userQuery.email;
    let NewPassword = userQuery.password;

    if (fName) NewFName = fName;
    if (lName) NewLName = lName;
    if (tel) NewTel = tel;
    if (email) NewEmail = email;
    if (password) NewPassword = password;

    const updateQuery = await Users.update({ firstName: NewFName, lastName: NewLName, tel: NewTel, email: NewEmail, password: NewPassword }, { where: { id: id } });
    if (!updateQuery) {
      return res.status(400).json({ message: "User update failed" });
    }

    return res.status(200).json({ message: "User updated successfully" });
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
        email: req.session.user.email,
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
      where: { id: userId },
      attributes: ['id', 'firstName', 'lastName', 'email', 'tel', 'birthday', 'money']
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
      where: { id: userId }
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

router.post('/deposit', requireOwnership, async (req, res) => {
  try {
    const { id, amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const depositAmount = parseFloat(amount);

    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await Users.findOne({
      where: { id: id },
      attributes: ['id', 'email', 'money']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    //calculate new balance
    const currentBalance = parseFloat(user.money) || 0;
    const newBalance = currentBalance + depositAmount;

    await Users.update(
      { money: newBalance.toFixed(2) },
      { where: { email: req.session.user.email } }
    );

    res.status(200).json({
      message: 'Deposit successful',
      transaction: {
        type: 'deposit',
        amount: depositAmount,
        previousBalance: currentBalance,
        newBalance: newBalance,
        timestamp: new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })
      }
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/withdraw', requireOwnership, async (req, res) => {
  try {
    const { id, amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const withdrawAmount = parseFloat(amount);

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await Users.findOne({
      where: { id: id },
      attributes: ['id', 'email', 'money']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentBalance = parseFloat(user.money) || 0;

    if (currentBalance < withdrawAmount) {
      return res.status(400).json({
        message: 'Insufficient balance',
        currentBalance: currentBalance,
        requestedAmount: withdrawAmount
      });
    }

    const newBalance = currentBalance - withdrawAmount;

    await Users.update(
      { money: newBalance.toFixed(2) },
      { where: { id: id } }
    );

    res.status(200).json({
      message: 'Withdrawal successful',
      transaction: {
        type: 'withdrawal',
        amount: withdrawAmount,
        previousBalance: currentBalance,
        newBalance: newBalance,
        timestamp: new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })
      }
    });

  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

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

    // TODO: ดึงข้อมูลจาก database
    // const userData = await Users.findOne({
    //   where: { user_id: userId },
    //   attributes: ['user_id', 'firstName', 'lastName', 'phone', 'userPicture']
    // });

    // if (!userData) {
    //   return res.status(404).json({ 
    //     status: "error",
    //     message: "User not found" 
    //   });
    // }

    // Mock data สำหรับทดสอบ logic
    const mockUserData = {
      user_id: userId,
      firstName: "08xxxxxxxx",
      lastName: "",
      phone: "08xxxxxxxx",
      userPicture: null
    };

    res.status(200).json({
      status: "success",
      message: "User profile retrieved successfully",
      data: {
        userId: mockUserData.user_id,
        firstName: mockUserData.firstName,
        lastName: mockUserData.lastName,
        phone: mockUserData.phone,
        userPicture: mockUserData.userPicture
      }
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

    // TODO: ตรวจสอบว่ามี user นี้อยู่จริงหรือไม่
    // const existingUser = await Users.findOne({
    //   where: { user_id: userId }
    // });

    // if (!existingUser) {
    //   return res.status(404).json({ 
    //     status: "error",
    //     message: "User not found" 
    //   });
    // }

    // TODO: ตรวจสอบว่าเบอร์โทรซ้ำกับ user อื่นหรือไม่ (ถ้ามีการเปลี่ยนเบอร์)
    // if (phone && phone !== existingUser.phone) {
    //   const phoneExists = await Users.findOne({
    //     where: { phone: phone }
    //   });
    //   if (phoneExists) {
    //     return res.status(400).json({ 
    //       status: "error",
    //       message: "Phone number already exists" 
    //     });
    //   }
    // }

    // TODO: อัพเดทข้อมูลใน database
    // const updateData = {};
    // if (firstName) updateData.firstName = firstName;
    // if (lastName) updateData.lastName = lastName;
    // if (phone) updateData.phone = phone;
    // if (userPicture) updateData.userPicture = userPicture;

    // await Users.update(updateData, {
    //   where: { user_id: userId }
    // });

    // TODO: ดึงข้อมูลที่อัพเดทแล้ว
    // const updatedUser = await Users.findOne({
    //   where: { user_id: userId },
    //   attributes: ['user_id', 'firstName', 'lastName', 'phone', 'userPicture']
    // });

    // Mock response
    res.status(200).json({
      status: "success",
      message: "User profile updated successfully",
      data: {
        userId: userId,
        firstName: firstName || "08xxxxxxxx",
        lastName: lastName || "",
        phone: phone || "08xxxxxxxx",
        userPicture: userPicture || null
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
});



function validateBirthday(birthday) {
  const dateFormat = new Date(birthday).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - dateFormat;
  if (dateFormat > currentYear) return false;
  if (age > 100 || age < 20) return false;
  return true;
}

module.exports = router;