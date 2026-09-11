const express = require('express');
const { razorpayWebhook } = require('../controllers/webhook.controller');

const router = express.Router();

// Public: Razorpay calls this endpoint with payment events
// Supports both direct access (/webhooks/razorpay) and gateway forwarded path (/payments/webhooks/razorpay)
router.post(['/webhooks/razorpay', '/payments/webhooks/razorpay'], express.raw({ type: 'application/json' }), razorpayWebhook);

module.exports = router;
