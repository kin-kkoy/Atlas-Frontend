const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { loginLimiter } = require('../middleware/authMiddleware');

router.post('/register', employeeController.register);
router.post('/login', loginLimiter, employeeController.login);
router.post('/forgot-password', employeeController.forgotPassword);
router.post('/reset-password', employeeController.resetPassword);

module.exports = router;