const User = require('../models/users');
const nodemailer = require('nodemailer');

// 🟩 เก็บ OTP แบบชั่วคราวในหน่วยความจำ
let otpStore = {};

// 🟦 ฟังก์ชันสร้าง OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateAvatar = (email) => {
  const seed = email || Math.random().toString(36).substring(2);
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
};

// 🟪 ฟังก์ชันส่ง OTP ผ่าน Gmail SMTP
const sendOtpToEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    }
  });

  await transporter.sendMail({
    from: `"${process.env.SENDER_NAME}" <${process.env.SMTP_EMAIL}>`,
    to: email.toLowerCase(),
    subject: "Your OTP Code",
    html: `
      <h2>รหัสยืนยันตัวตน (OTP)</h2>
      <p>รหัสของคุณคือ:</p>
      <h1>${otp}</h1>
      <p>รหัสนี้มีอายุ 5 นาที</p>
    `
  });

  console.log("OTP sent to:", email);
};

// ⭐ ฟังก์ชัน reusable สำหรับสร้าง user
const createUserLogic = async ({ firstName = null, lastName = null, email }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) return existing;

  const avatarUrl = generateAvatar(email);

  const user = await User.create({
    firstName,
    lastName,
    email,
    userPicture: avatarUrl
  });

  return user;
};



// --------------------- USER CRUD ---------------------

// CREATE user
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await createUserLogic({ firstName, lastName, email });

    res.status(201).json(user);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE user by ID
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { firstName, lastName, userPicture } = req.body;

    await user.update({
      firstName,
      lastName,
      userPicture
    });

    return res.json(user);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Update failed" });
  }
};

// GET user by email
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// --------------------- OTP SERVICE ---------------------

// 🟩 ส่ง OTP ไปอีเมล
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    // สร้าง OTP
    const otp = generateOtp();

    // เก็บ OTP ชั่วคราว 5 นาที
    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    // ส่งอีเมล
    await sendOtpToEmail(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// 🟦 ตรวจสอบ OTP
exports.verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    email = email.toLowerCase();

    const record = otpStore[email];

    if (!record) return res.status(400).json({ error: "OTP ไม่พบหรือหมดอายุ" });
    if (Date.now() > record.expires) {
      delete otpStore[email];
      return res.status(400).json({ error: "OTP หมดอายุแล้ว" });
    }
    if (record.otp !== otp) {
      return res.status(400).json({ error: "OTP ไม่ถูกต้อง" });
    }

    delete otpStore[email];

    // ⭐ ใช้ logic เดียวกับ createUser
    const user = await createUserLogic({ email });

    return res.json({ message: "OTP ถูกต้อง", user });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

