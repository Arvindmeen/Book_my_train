const express = require('express');
const {getUserContext} = require('../middlewares/getUserContext.middleware');
const { internalAuth } = require('../middlewares/internalAuth.middleware');
const { getProfile, updateProfile, deleteProfile, getUserInternal, changePassword } = require('../controllers/user.controller');

const router = express.Router();

router.get("/profile", getUserContext, getProfile);
router.put("/profile", getUserContext, updateProfile);
router.put("/change-password", getUserContext, changePassword);
router.delete("/profile", getUserContext, deleteProfile);

router.get("/internal/:userId", internalAuth, getUserInternal);

module.exports = router;