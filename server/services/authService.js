import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/userModel.js';
import * as auditService from './auditService.js';
export const registerUser = async (userData) => {
  const existingUser = await userModel.findUserByUsername(userData.username);
  if (existingUser) {
    throw { statusCode: 400, message: 'Username is already in use.' };
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

  const userId = await userModel.createUser({
    ...userData,
    password_hash: hashedPassword
  });

  await auditService.logAction(userId, 'REGISTER', 'User account created', null);

  return { userId };
};

export const loginUser = async (username, password, ipAddress) => {
  let user = await userModel.findUserByUsername(username);
  if (!user) {
    await auditService.logAction(null, 'LOGIN_FAILED', `Failed login attempt for unknown username: ${username}`, ipAddress);
    throw { statusCode: 401, message: 'Username or password incorrect.' };
  }

  if (user.status === 'locked') {
    const timeDiff = Date.now() - new Date(user.updated_at).getTime();
    if (timeDiff > 30000) {
      // Auto-unlock after 30 seconds
      await userModel.unlockUser(user.id);
      // Fetch updated user status
      user = await userModel.findUserByUsername(username);
    } else {
      const remaining = Math.ceil((30000 - timeDiff) / 1000);
      throw { statusCode: 403, message: `Account is temporarily locked. Try again in ${remaining} seconds.`, remaining };
    }
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const attempts = user.failed_login_attempts + 1;
    if (attempts >= 3) {
      await userModel.lockUser(user.id);
      await auditService.logAction(user.id, 'USER_LOCKED', 'Account locked due to 3 failed login attempts', ipAddress);
      throw { statusCode: 403, message: 'Account locked due to 3 failed login attempts. Try again in 30 seconds.', remaining: 30 };
    } else {
      await userModel.incrementFailedLogin(user.id);
      await auditService.logAction(user.id, 'LOGIN_FAILED', `Failed login attempt ${attempts}/3`, ipAddress);
      throw { statusCode: 401, message: `Username or password incorrect. Attempt ${attempts} of 3.` };
    }
  }

  // Reset attempts on successful login
  if (user.failed_login_attempts > 0) {
    await userModel.resetFailedLogin(user.id);
  }

  await auditService.logAction(user.id, 'LOGIN_SUCCESS', 'User logged in successfully', ipAddress);

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, branch_id: user.branch_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  return { token, user: { id: user.id, full_name: user.full_name, username: user.username, role: user.role } };
};

export const getUserProfile = async (userId) => {
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw { statusCode: 404, message: 'User not found.' };
  }
  return user;
};
