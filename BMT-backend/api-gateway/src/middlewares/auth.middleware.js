const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { UnauthorizedError, ForbiddenError } = require('../utils/error');
const logger = require('../config/logger');

/**
 * Middleware to verify access token from Authorization header or cookie
 * Extracts user ID & role and attaches them to request headers for downstream services
 */
function requireAuth(req, res, next) {
     try {
          let accessToken;

          // 1. Try Authorization header (service-to-service / mobile clients)
          const authHeader = req.headers.authorization;
          if (authHeader && authHeader.startsWith('Bearer ')) {
               accessToken = authHeader.split(' ')[1];
          }

          // 2. Fall back to httpOnly cookie (browser clients)
          if (!accessToken && req.cookies) {
               accessToken = req.cookies.accessToken;
          }

          if (!accessToken) {
               throw new UnauthorizedError('Authorization token missing');
          }

          // Verify access token
          const payload = jwt.verify(accessToken, config.JWT_ACCESS_SECRET);

          if (!payload.id) {
               throw new UnauthorizedError('Invalid token payload');
          }

          const userRole = payload.role || 'USER';

          // Attach user context to request for downstream services
          req.user = {
               id: payload.id,
               role: userRole,
          };

          // Add user ID and role to headers for proxied requests
          req.headers['x-user-id'] = payload.id.toString();
          req.headers['x-user-role'] = userRole;

          logger.debug(`User ${payload.id} (${userRole}) authenticated successfully`);

          next();
     } catch (err) {
          if (err.name === 'TokenExpiredError') {
               return next(new UnauthorizedError('Access token expired', 'TOKEN_EXPIRED'));
          }
          if (err.name === 'JsonWebTokenError') {
               return next(new UnauthorizedError('Invalid access token', 'TOKEN_INVALID'));
          }
          return next(err);
     }
}

/**
 * Middleware that requires the user to have the ADMIN role
 */
function requireAdmin(req, res, next) {
     requireAuth(req, res, (err) => {
          if (err) return next(err);
          if (req.user?.role !== 'ADMIN') {
               return next(new ForbiddenError('Access denied: Administrator privileges required'));
          }
          next();
     });
}

module.exports = { requireAuth, requireAdmin };