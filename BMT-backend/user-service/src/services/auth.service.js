const { ConflictError, BadRequestError, ForbiddenError, UnauthorizedError, NotFoundError } = require("../utils/error")
const {generateAndStoreOtp, verifyOtp} = require('../utils/otp');
const {generateAccessToken, generateRefreshToken, verifyRefreshToken} = require('../utils/auth');
const notificationProducer = require('../kafka/producer/notification.producer')
const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const {redis} = require('../config/redis');
const { config } = require("../config");
const logger = require('../config/logger');
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require("google-auth-library");
const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

const toSafeUser = (user) => {
     const {password: _password, ...safeUser} = user;
     const adminEmail = (config.ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'arvindmeena8171@gmail.com').toLowerCase().trim();
     const userEmail = (user.email || '').toLowerCase().trim();
     const isAdmin = Boolean(userEmail && userEmail === adminEmail);
     return {...safeUser, role: isAdmin ? 'ADMIN' : 'USER', isAdmin};
};

const sendOTP = async(firstName, lastName, email, password) =>{
     const existingUser = await prisma.user.findUnique({
          where: {email}
     })

     if(existingUser){
          throw new ConflictError("user already exists");
     }
     const hashedPassword = await bcrypt.hash(password, 12);
     const meta = {firstName, lastName, email, hashedPassword};
     const {otp, otpSessionId} = await generateAndStoreOtp(meta);
     await notificationProducer.sendOtpEmail(email, otp, (config.OTP_TTL) / 60);
     logger.info(`OTP email queued for : ${email}`);
     return {otpSessionId}
}

const verifyOTP = async(otp, otpSessionId) =>{
     const meta = await verifyOtp(otp, otpSessionId);
     if(meta === null){
          throw new BadRequestError("Invalid or expired OTP", "OTP_INVALID");
     }
     const user = await prisma.user.create({
          data: {
               firstName: meta.firstName,
               lastName: meta.lastName,
               email: meta.email,
               password: meta.hashedPassword,
               emailVerified: true
          }
     })

     await notificationProducer.sendWelcomeEmail(meta.email, meta.firstName);
     logger.info(`Welcome email queued for ${meta.email}`);
     return user;
     
}

const login = async(email, password, deviceId) =>{
     const existingUser = await prisma.user.findUnique({
          where: {email}
     })
     if(!existingUser){
          throw new UnauthorizedError("Invalid email or password", "INVALID_CREDENTIALS");
     }
     if(!existingUser.password){
          throw new BadRequestError(
               "This account was created with Google. Please sign in with Google.",
               "OAUTH_ONLY_ACCOUNT"
          );
     }
     const doesPasswordMatch = await bcrypt.compare(password, existingUser.password);
     if(!doesPasswordMatch){
          throw new UnauthorizedError("Invalid email or password", "INVALID_CREDENTIALS");
     }
     const safeUser = toSafeUser(existingUser);
     const accessToken = generateAccessToken(existingUser.id, safeUser.role, existingUser.email);
     const refreshToken = generateRefreshToken(existingUser.id);
     const {jti} = jwt.decode(refreshToken);
     await redis.set(`refresh:${existingUser.id}:${deviceId}`, jti, 'EX', config.REFRESH_TOKEN_EXP_SEC);
     await redis.set(`user:${existingUser.id}`, JSON.stringify(safeUser), 'EX', config.REDIS_USER_TTL);
     return {accessToken, refreshToken, loggedInUser: safeUser};
}


const rotateRefreshToken = async(refreshToken, deviceId) =>{
     const payload = verifyRefreshToken(refreshToken);
     const {id: userId, jti} = payload;
     const storedJti = await redis.get(`refresh:${userId}:${deviceId}`);
     if(!storedJti){
          throw new ForbiddenError("Session Expired", "Login AGAIN")
     }
     if(storedJti !== jti){
          await redis.del(`refresh:${userId}:${deviceId}`);
          throw new ForbiddenError("Refresh token reused", "LOGIN AGAIN")
     }
     let safeUser;
     const cachedUser = await redis.get(`user:${userId}`);
     if (cachedUser) {
          try {
               safeUser = toSafeUser(JSON.parse(cachedUser));
          } catch (e) {}
     }
     if (!safeUser || !safeUser.email) {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          safeUser = user ? toSafeUser(user) : { role: 'USER' };
     }
     // Re-save healed safeUser to Redis
     await redis.set(`user:${userId}`, JSON.stringify(safeUser), 'EX', config.REDIS_USER_TTL);
     const newAccessToken = generateAccessToken(payload.id, safeUser.role || 'USER', safeUser.email);
     const newRefreshToken = generateRefreshToken(payload.id);
     const {jti: newJti} = jwt.decode(newRefreshToken);
     await redis.set(`refresh:${payload.id}:${deviceId}`, newJti, 'EX', config.REFRESH_TOKEN_EXP_SEC);
     return {newAccessToken, newRefreshToken};
}

const verifyGoogleIdToken = async(idToken, deviceId) =>{
     const ticket = await client.verifyIdToken({
          idToken,
          audience: config.GOOGLE_CLIENT_ID
     })
     const payload = ticket.getPayload();

     if(!payload.sub || !payload.email){
          throw new UnauthorizedError("Invalid Google Token Payload")
     }

     const googleUser = {
          provider: "google",
          providerId: payload.sub,
          email: payload.email,
          firstName: payload.given_name,
          lastName: payload.family_name,
          emailVerified: payload.email_verified || false
     }


     const user = await prisma.$transaction(async (tx) =>{
          let googleAuth = await tx.authProvider.findUnique({
               where: {
                    provider_providerId: {
                         provider: googleUser.provider,
                         providerId: googleUser.providerId
                    }
               },
               include: {user: true}
          })

          if(googleAuth){
               return googleAuth.user;
          }

          let existingUser = await tx.user.findUnique({
               where: {email: googleUser.email}
          })

          if(existingUser){
               await tx.authProvider.create({
                    data: {
                         provider: googleUser.provider,
                         providerId: googleUser.providerId,
                         userId: existingUser.id
                    }
               })
               return existingUser;
          }

          return await tx.user.create({
               data: {
                    email: googleUser.email,
                    firstName: googleUser.firstName,
                    lastName: googleUser.lastName,
                    emailVerified: googleUser.emailVerified,
                    AuthProviders: {
                         create: {
                              provider: googleUser.provider,
                              providerId: googleUser.providerId
                         }
                    }
               }
          })
     })

     const safeUser = toSafeUser(user);
     const accessToken = generateAccessToken(user.id, safeUser.role);
     const refreshToken = generateRefreshToken(user.id);
     const {jti} = jwt.decode(refreshToken);
     await redis.set(`refresh:${user.id}:${deviceId}`, jti, 'EX', config.REFRESH_TOKEN_EXP_SEC);
     await redis.set(`user:${user.id}`, JSON.stringify(safeUser), 'EX', config.REDIS_USER_TTL);
     return {accessToken, refreshToken, loggedInUser: safeUser};
     
}

const forgotPassword = async (email) => {
     const normalizedEmail = email.toLowerCase().trim();
     const user = await prisma.user.findUnique({
          where: { email: normalizedEmail }
     });

     if (!user) {
          throw new NotFoundError("No account found with this email address");
     }

     if (!user.password) {
          throw new BadRequestError("This account was registered with Google. Please sign in using Google.");
     }

     const meta = { email: user.email, purpose: 'PASSWORD_RESET', userId: user.id };
     const { otp, otpSessionId } = await generateAndStoreOtp(meta);

     await notificationProducer.sendOtpEmail(user.email, otp, Math.round(config.OTP_TTL / 60));
     logger.info(`Password reset OTP sent to: ${user.email}`);

     return { otpSessionId };
};

const resetPassword = async (otp, otpSessionId, newPassword) => {
     if (!newPassword || newPassword.length < 6) {
          throw new BadRequestError("Password must be at least 6 characters long");
     }

     const meta = await verifyOtp(otp, otpSessionId);
     if (!meta || meta.purpose !== 'PASSWORD_RESET') {
          throw new BadRequestError("Invalid or expired OTP code", "OTP_INVALID");
     }

     const hashedPassword = await bcrypt.hash(newPassword, 12);

     const updatedUser = await prisma.user.update({
          where: { email: meta.email },
          data: { password: hashedPassword }
     });

     // Invalidate existing sessions in Redis for security
     try {
          const keys = await redis.keys(`refresh:${meta.userId || updatedUser.id}:*`);
          if (keys && keys.length > 0) {
               await redis.del(...keys);
          }
          await redis.del(`user:${meta.userId || updatedUser.id}`);
     } catch (err) {
          logger.warn(`Could not clear old sessions from Redis: ${err.message}`);
     }

     logger.info(`Password successfully reset for: ${meta.email}`);
     return { email: meta.email };
};

module.exports = {
     sendOTP, 
     verifyOTP, 
     login, 
     rotateRefreshToken, 
     verifyGoogleIdToken,
     forgotPassword,
     resetPassword
};