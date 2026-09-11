require('dotenv').config();
console.log("cwd =", process.cwd());
console.log("env =", process.env.ELASTICSEARCH_URL);
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { config } = require('./config');
const logger = require('./config/logger');
const { initIndices, recreateIndices } = require('./config/elasticsearch');

const { corsMiddleware } = require('./middlewares/cors.middleware');
const errorHandler = require('./middlewares/error.middleware');
const { reqLogger } = require('./middlewares/req.middleware');

const searchRoutes = require('./routes/search.route');
const searchConsumer = require('./kafka/consumer/search.consumer');
const { disconnectAll } = require('./config/kafka');

const app = express();

app.use(corsMiddleware);
app.use(helmet({
     crossOriginOpenerPolicy: false,
     crossOriginEmbedderPolicy: false,
     contentSecurityPolicy: {
          directives: {
               defaultSrc: ["'self'"],
               scriptSrc: ["'self'", "'unsafe-inline'"],
               styleSrc: ["'self'", "'unsafe-inline'"],
               imgSrc: ["'self'", "data:"],
               connectSrc: ["'self'"],
          },
     },
}));
app.use(reqLogger);
app.use(express.json());
app.use(cookieParser());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Mount search routes at root (gateway strips first path segment)
app.use(searchRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: config.SERVICE_NAME }));
app.use(errorHandler);

const connectWithRetry = async (fn, name, maxRetries = 10, delayMs = 3000) => {
     for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
               await fn();
               logger.info(`Successfully initialized ${name}`);
               return;
          } catch (err) {
               logger.warn(`Failed to initialize ${name} (attempt ${attempt}/${maxRetries}): ${err.message}`);
               if (attempt === maxRetries) throw err;
               await new Promise((r) => setTimeout(r, delayMs));
          }
     }
};

const startServer = async () => {
     try {
          // Initialize Elasticsearch indices with retry
          await connectWithRetry(async () => {
               if (process.env.ES_RECREATE_INDICES === 'true') {
                    await recreateIndices();
               } else {
                    await initIndices();
               }
          }, 'Elasticsearch Indices');

          // Initialize Kafka consumer with retry
          await connectWithRetry(async () => {
               await searchConsumer.start();
          }, 'Search Kafka Consumer');

          const server = app.listen(config.PORT, () => {
               logger.info(`${config.SERVICE_NAME} running on http://localhost:${config.PORT}`);
          });

          const shutdown = async () => {
               logger.info('Shutting down...');
               server.close(async () => {
                    await disconnectAll();
                    process.exit(0);
               });
          };
          process.on('SIGTERM', shutdown);
          process.on('SIGINT', shutdown);
     } catch (err) {
          logger.error('Fatal error starting search service:', err);
          process.exit(1);
     }
};

startServer();

// Nodemon restart trigger at 2026-08-27T12:18:59.888Z
