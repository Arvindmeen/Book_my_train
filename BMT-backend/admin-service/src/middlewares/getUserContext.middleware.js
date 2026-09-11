const { UnauthorizedError, ForbiddenError } = require('../utils/error');

/**
 * Extract user context from gateway headers
 * Gateway sets x-user-id and x-user-role after JWT verification
 */
function getUserContext(req, res, next) {
     const userId = req.headers['x-user-id'];

     if (!userId) {
          return next(
               new UnauthorizedError('User context missing - must come through gateway')
          );
     }

     const userRole = req.headers['x-user-role'] || 'USER';
     req.user = { id: userId, role: userRole };
     next();
}

/**
 * Enforce that the incoming request has the ADMIN role
 */
function requireAdminRole(req, res, next) {
     getUserContext(req, res, (err) => {
          if (err) return next(err);
          if (req.user?.role !== 'ADMIN') {
               return next(
                    new ForbiddenError('Access denied: Administrator privileges required')
               );
          }
          next();
     });
}

module.exports = { getUserContext, requireAdminRole };