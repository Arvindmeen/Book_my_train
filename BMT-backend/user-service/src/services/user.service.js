const { config } = require("../config");
const {redis} = require("../config/redis");
const prisma = require('../config/prisma');
const logger = require('../config/logger');
const bcrypt = require('bcrypt');
const { BadRequestError, NotFoundError } = require("../utils/error");



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

const changePassword = async (userId, oldPassword, newPassword) => {
     logger.info(`Changing password for user ${userId}`);
     const user = await prisma.user.findUnique({
          where: { id: userId }
     });

     if (!user) {
          throw new NotFoundError("User not found");
     }

     if (!user.password) {
          throw new BadRequestError("This account uses Google Sign-In. Password cannot be changed.");
     }

     if (!oldPassword) {
          throw new BadRequestError("Current password is required");
     }

     const isMatch = await bcrypt.compare(oldPassword, user.password);
     if (!isMatch) {
          throw new BadRequestError("Current password is incorrect");
     }

     if (!newPassword || newPassword.length < 6) {
          throw new BadRequestError("New password must be at least 6 characters long");
     }

     const hashedPassword = await bcrypt.hash(newPassword, 12);
     await prisma.user.update({
          where: { id: userId },
          data: { password: hashedPassword }
     });

     logger.info(`Password successfully changed for user ${userId}`);
     return { message: "Password updated successfully" };
};

module.exports = { getProfile, updateProfile, deleteProfile, changePassword };