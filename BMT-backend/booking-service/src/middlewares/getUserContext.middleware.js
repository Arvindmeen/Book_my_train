const { UnauthorizedError } = require('../utils/error');

function getUserContext(req, res, next) {
     const userId = req.headers['x-user-id'];
     const userRole = req.headers['x-user-role'];

     if (!userId) {
          return next(
               new UnauthorizedError('User context missing - must come through gateway')
          );
     }

     req.user = { id: userId, role: userRole };
     next();
}

module.exports = { getUserContext };
