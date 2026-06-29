// const cors = require('cors');
// const { config } = require('../config');

// const allowedOrigins = config.ALLOWED_ORIGINS
//      ? config.ALLOWED_ORIGINS.split(',').map(o => o.trim())
//      : [];

// const corsMiddleware = cors({
//      origin: function (origin, callback) {

//           if (!origin) return callback(null, true);

//           if (allowedOrigins.includes(origin)) {
//                callback(null, true);
//           } else {
//                callback(new Error('Not allowed by CORS'));
//           }
//      },
//      credentials: true,
//      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//      allowedHeaders: ['Content-Type', 'Authorization'],
// });

// module.exports = { corsMiddleware };







const cors = require('cors');
const { config } = require('../config');

const allowedOrigins = config.ALLOWED_ORIGINS
    ? config.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [];

console.log("Allowed Origins:", allowedOrigins);

const corsMiddleware = cors({
    origin: function (origin, callback) {
        console.log("Incoming Origin:", origin);

        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.log("Blocked Origin:", origin);

        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});

module.exports = { corsMiddleware };