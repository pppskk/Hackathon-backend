const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { requireAuth, requireOwnership } = require('../function/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes - ต้อง login ก่อน
router.post('/logout', requireAuth, userController.logout);
router.get('/check', requireAuth, userController.checkAuth);

// Get user by phone (for login check)
router.get('/by-phone', userController.getUserByPhone);

// Protected routes - ต้อง login และเป็นเจ้าของข้อมูล
router.get('/:id', requireAuth, requireOwnership, userController.getUserById);
router.put('/:id', requireAuth, requireOwnership, userController.updateUser);
router.delete('/:id', requireAuth, requireOwnership, userController.deleteUser);

module.exports = router;