const authServiceFactory = require('../services/authService');
const { registerSchema, loginSchema, refreshSchema } = require('../validations/authValidation');

class AuthController {
  constructor(fastify) {
    this.fastify = fastify;
  }

  async register(req, reply) {
    try {
      const { email, password } = req.body;
      const { error } = registerSchema.validate({ email, password });
      if (error) {
        return reply.code(400).send({ error: error.details[0].message });
      }

      const authService = new authServiceFactory(this.fastify);
      const result = await authService.registerUser(email, password);
      return reply.code(201).send(result);

    } catch (err) {
      if (err.message === 'Email already in use') {
        return reply.code(409).send({ error: 'Email already in use' });
      }
      req.log.error(err);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }

  async login(req, reply) {
    try {
      const { email, password } = req.body;
      const { error } = loginSchema.validate({ email, password });
      if (error) {
        return reply.code(400).send({ error: error.details[0].message });
      }

      const authService = new authServiceFactory(this.fastify);
      const tokens = await authService.loginUser(email, password);
      return reply.send(tokens);

    } catch (err) {
      if (err.message === 'Invalid credentials') {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }
      req.log.error(err);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }

  async refresh(req, reply) {
    try {
      const { refreshToken } = req.body;
      const { error } = refreshSchema.validate({ refreshToken });
      if (error) {
        return reply.code(400).send({ error: error.details[0].message });
      }

      const authService = new authServiceFactory(this.fastify);
      const result = await authService.refreshAccessToken(refreshToken);
      return reply.send(result);

    } catch (err) {
      if (err.message === 'Invalid or expired refresh token') {
        return reply.code(401).send({ error: 'Invalid or expired refresh token' });
      }
      if (err.message === 'Not a refresh token') {
        return reply.code(400).send({ error: 'Not a refresh token' });
      }
      req.log.error(err);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }

  async logout(req, reply) {
    try {
      const { refreshToken } = req.body;
      const authService = new authServiceFactory(this.fastify);
      await authService.revokeRefreshToken(refreshToken);
      return reply.send({ message: 'Logged out successfully' });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }
}

module.exports = (fastify) => new AuthController(fastify);
