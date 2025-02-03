const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');
const redisClient = require('./redisClient');
require('dotenv').config();

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);;

const ACCESS_TOKEN_EXP = process.env.ACCESS_TOKEN_EXP || '45m';
const REFRESH_TOKEN_EXP = parseInt(process.env.REFRESH_TOKEN_EXP || '604800', 10);

class AuthService {
  constructor(fastify) {
    this.fastify = fastify; 
  }

  async registerUser(email, plainPassword) {
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    const newUser = await userRepository.createUser({ email, password: hashedPassword });

    const tokens = await this.generateTokens(newUser.id, newUser.email);
    return { user: newUser, ...tokens };
  }

  async loginUser(email, plainPassword) {
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const match = await bcrypt.compare(plainPassword, user.password);
    if (!match) {
      throw new Error('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    return tokens;
  }

  async generateTokens(userId, email) {
    const accessToken = this.fastify.jwt.sign(
      { id: userId, email },
      { expiresIn: ACCESS_TOKEN_EXP }
    );

    const refreshToken = this.fastify.jwt.sign(
      { id: userId, email, isRefresh: true },
      { expiresIn: '7d' }
    );

    await redisClient.set(
      `refreshToken:${refreshToken}`,
      String(userId),
      'EX',
      REFRESH_TOKEN_EXP
    );

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken) {
    const redisKey = `refreshToken:${refreshToken}`;
    const userId = await redisClient.get(redisKey);
    if (!userId) {
      throw new Error('Invalid or expired refresh token');
    }

    let decoded;
    try {
      decoded = this.fastify.jwt.verify(refreshToken);
    } catch (err) {
      throw new Error('Invalid or expired refresh token');
    }

    if (!decoded.isRefresh) {
      throw new Error('Not a refresh token');
    }

    const newAccessToken = this.fastify.jwt.sign(
      { id: decoded.id, email: decoded.email },
      { expiresIn: ACCESS_TOKEN_EXP }
    );

    return { accessToken: newAccessToken };
  }

  async revokeRefreshToken(refreshToken) {
    const redisKey = `refreshToken:${refreshToken}`;
    await redisClient.del(redisKey);
    return true;
  }
}

module.exports = AuthService;
