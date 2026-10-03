const express = require('express');
const router = express.Router();
const {
     sendOTP, 
     verifyOTP, 
     login, 
     rotateRefreshToken, 
     verifyGoogleIdToken,
     forgotPassword,
     resetPassword
} = require('../controllers/auth.controller');

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/refresh", rotateRefreshToken);
router.post("/google-auth", verifyGoogleIdToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;