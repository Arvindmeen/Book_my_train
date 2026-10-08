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
     const adminEmail = (config.ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'arvindmeena8171@gmail.com').toLowerCase().trim();
     const userEmail = (safeUser.email || '').toLowerCase().trim();
     const isAdmin = Boolean(userEmail && userEmail === adminEmail);
     const result = { ...safeUser, role: isAdmin ? 'ADMIN' : 'USER', isAdmin };
     logger.info("Store user profile in redis for future lookups");
     await redis.set(`user:${userId}`, JSON.stringify(result), 'EX', config.REDIS_USER_TTL);
     return result;
}

const updateProfile = async (userId, data) => {
     logger.info(`Updating user ${userId} in DB`);
     const { 
          firstName, lastName, email,
          phone, gender, dateOfBirth,
          city, state, pincode, address,
          profilePicture, berthPreference, foodPreference,
          emergencyContactName, emergencyContactPhone, irctcUsername
     } = data;

     const updateData = {};
     if (firstName !== undefined) updateData.firstName = firstName;
     if (lastName !== undefined) updateData.lastName = lastName;
     if (email !== undefined) updateData.email = email;
     if (phone !== undefined) updateData.phone = phone;
     if (gender !== undefined) updateData.gender = gender;
     if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
     if (city !== undefined) updateData.city = city;
     if (state !== undefined) updateData.state = state;
     if (pincode !== undefined) updateData.pincode = pincode;
     if (address !== undefined) updateData.address = address;
     if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
     if (berthPreference !== undefined) updateData.berthPreference = berthPreference;
     if (foodPreference !== undefined) updateData.foodPreference = foodPreference;
     if (emergencyContactName !== undefined) updateData.emergencyContactName = emergencyContactName;
     if (emergencyContactPhone !== undefined) updateData.emergencyContactPhone = emergencyContactPhone;
     if (irctcUsername !== undefined) updateData.irctcUsername = irctcUsername;

     const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: updateData
     });

     const { password: _password, ...safeUser } = updatedUser;
     const adminEmail = (config.ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'arvindmeena8171@gmail.com').toLowerCase().trim();
     const userEmail = (safeUser.email || '').toLowerCase().trim();
     const isAdmin = Boolean(userEmail && userEmail === adminEmail);
     const result = { ...safeUser, role: isAdmin ? 'ADMIN' : 'USER', isAdmin };
     await redis.set(`user:${userId}`, JSON.stringify(result), 'EX', config.REDIS_USER_TTL);
     return result;
};

const deleteProfile = async (userId) => {
     logger.info(`Deleting user ${userId} from DB and Redis`);
     await prisma.user.delete({ where: { id: userId } });
     await redis.del(`user:${userId}`);
};

module.exports = { getProfile, updateProfile, deleteProfile };