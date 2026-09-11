const express = require('express');
const { createSchedule, cancelSchedule, getAllSchedules } = require('../controllers/schedule.controller');
const { getUserContext, requireAdminRole } = require('../middlewares/getUserContext.middleware');

const router = express.Router();

router.post("/schedule", requireAdminRole, createSchedule);
router.put('/schedule/:scheduleId', requireAdminRole, cancelSchedule);
router.get('/schedule', getUserContext, getAllSchedules);
module.exports = router;