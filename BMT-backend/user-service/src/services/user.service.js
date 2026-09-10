const { config } = require("../config");
const {redis} = require("../config/redis");
const prisma = require('../config/prisma');
const logger = require('../config/logger');



const getProfile = async(userId) =>{
     logger.info("First check user in Redis");

     const storedUser = await redis.get(`user:${userId}`);
     if(storedUser){
          logger.info("Fetched user profile from redis");
          return JSON.parse(storedUser);
     }
     logger.info("If user is not in redis, fetch user from DB");
     const userProfile = await prisma.user.findUnique({
          where: {
               id: userId
          }
     })
     
     logger.info("Exclude password field from the user");
     const {password: _password, ...safeUser} = userProfile;
     logger.info("Store user profile in redis for future lookups");
     await redis.set(`user:${userId}`, JSON.stringify(safeUser), 'EX', config.REDIS_USER_TTL);
     return safeUser;
}

const updateProfile = async (userId, data) => {
     logger.info(`Updating user ${userId} in DB`);
     const { firstName, lastName, email } = data;
     const updateData = {};
     if (firstName !== undefined) updateData.firstName = firstName;
     if (lastName !== undefined) updateData.lastName = lastName;
     if (email !== undefined) updateData.email = email;

     const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: updateData
     });

     const { password: _password, ...safeUser } = updatedUser;
     await redis.set(`user:${userId}`, JSON.stringify(safeUser), 'EX', config.REDIS_USER_TTL);
     return safeUser;
};

const deleteProfile = async (userId) => {
     logger.info(`Deleting user ${userId} from DB and Redis`);
     await prisma.user.delete({ where: { id: userId } });
     await redis.del(`user:${userId}`);
};

module.exports = { getProfile, updateProfile, deleteProfile };