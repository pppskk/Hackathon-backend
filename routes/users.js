const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');

router.get('/by-email', controller.getUserByEmail);   // 👈 เพิ่มตรงนี้
router.post('/send-otp', controller.sendOtp);
router.post('/verify-otp', controller.verifyOtp);
router.post('/', controller.createUser);
router.get('/:id', controller.getUser);
router.put('/:id', controller.updateUser);




module.exports = router;