const asyncHandler = require("../utils/asyncHandler");
const { BadRequestError, NotFoundError } = require("../utils/error");
const userService = require('../services/user.service');
const logger = require("../config/logger");


exports.getProfile = asyncHandler(async(req, res) =>{
     const userId = req.user.id;
     if(!userId){
          throw new BadRequestError("User Id is missing");
     }

     const user = await userService.getProfile(userId);
     return res.status(200).json({
          success: true,
          message: "Fetched user details",
          data: {
               user
          }
     })
})

exports.updateProfile = asyncHandler(async(req, res) =>{
     const userId = req.user.id;
     if(!userId){
          throw new BadRequestError("User Id is missing");
     }

     const { 
          firstName, lastName, email,
          phone, gender, dateOfBirth,
          city, state, pincode, address,
          profilePicture, berthPreference, foodPreference,
          emergencyContactName, emergencyContactPhone, irctcUsername
     } = req.body;

     const user = await userService.updateProfile(userId, { 
          firstName, lastName, email,
          phone, gender, dateOfBirth,
          city, state, pincode, address,
          profilePicture, berthPreference, foodPreference,
          emergencyContactName, emergencyContactPhone, irctcUsername
     });
     return res.status(200).json({
          success: true,
          message: "User profile updated successfully",
          data: {
               user
          }
     })
})

exports.deleteProfile = asyncHandler(async(req, res) =>{
     const userId = req.user.id;
     if(!userId){
          throw new BadRequestError("User Id is missing");
     }

     await userService.deleteProfile(userId);
     return res.status(200).json({
          success: true,
          message: "User deleted successfully"
     })
})

exports.getUserInternal = asyncHandler(async(req, res) =>{
     const { userId } = req.params;
     if(!userId){
          throw new BadRequestError("User Id is missing");
     }

     const user = await userService.getProfile(userId);
     if(!user){
          throw new NotFoundError("User not found");
     }

     return res.status(200).json({
          success: true,
          data: {
               id: user.id,
               firstName: user.firstName,
               lastName: user.lastName,
               email: user.email,
          }
     });
})

exports.changePassword = asyncHandler(async (req, res) => {
     const userId = req.user.id;
     if (!userId) {
          throw new BadRequestError("User Id is missing");
     }

     const { oldPassword, newPassword, confirmPassword } = req.body;
     if (!oldPassword || !newPassword) {
          throw new BadRequestError("Current password and new password are required");
     }

     if (confirmPassword && newPassword !== confirmPassword) {
          throw new BadRequestError("Passwords do not match");
     }

     const result = await userService.changePassword(userId, oldPassword, newPassword);
     return res.status(200).json({
          success: true,
          message: result.message || "Password changed successfully"
     });
});