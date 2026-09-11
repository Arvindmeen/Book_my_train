const express = require('express');
const { createTrain, createRoute, getAllTrains, getTrainById } = require('../controllers/train.controller');
const { getUserContext, requireAdminRole } = require('../middlewares/getUserContext.middleware');

const router = express.Router();

router.post("/train", requireAdminRole, createTrain);
router.get("/train", getUserContext, getAllTrains);
router.get("/train/:trainId", getUserContext, getTrainById);
router.post("/route", requireAdminRole, createRoute);

module.exports = router;