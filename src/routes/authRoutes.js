module.exports = async function authRoutes(fastify) {
    const authController = require('../controllers/authController')(fastify);
    fastify.post('/register', (req, reply) => authController.register(req, reply));
    fastify.post('/login', (req, reply) => authController.login(req, reply));
    fastify.post('/refresh', (req, reply) => authController.refresh(req, reply));
    fastify.post('/logout', (req, reply) => authController.logout(req, reply));
};