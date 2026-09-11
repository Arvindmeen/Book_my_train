const cors = require('cors');
const { config } = require('../config');

const allowedOrigins = config.ALLOWED_ORIGINS
     ? config.ALLOWED_ORIGINS.split(',').map(o => o.trim().replace(/\/$/, ''))
     : [];

const corsMiddleware = cors({
     origin: function (origin, callback) {
          if (!origin) return callback(null, true);

          const normalizedOrigin = origin.replace(/\/$/, '');
          if (allowedOrigins.includes(normalizedOrigin)) {
               callback(null, true);
          } else {
               // Return false instead of throwing Error to prevent 500 on preflight
               callback(null, false);
          }
     },
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-idempotency-key'],
});

module.exports = { corsMiddleware };
