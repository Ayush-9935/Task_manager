const express = require('express');
const { register, login, logout, getMe, getUsers, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/profile', protect, getMe);
router.get('/users', protect, authorize('Admin'), getUsers);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
