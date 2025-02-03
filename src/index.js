const fastify = require("fastify")({ logger: true });
const db = require("./models");
const redisClient = require('./services/redisClient');
const logger = require("./utils/logger");

const alertRoutes = require("./routes/alertRoutes");
const alertHistoryRoutes = require("./routes/alerHistoryRoutes");
const authRoutes = require("./routes/authRoutes");
const { startCronJob } = require('./services/priceChecker');

const swagger = require("@fastify/swagger");
const swaggerUi = require("@fastify/swagger-ui");
const fastifyHelmet = require("@fastify/helmet");
const fastifyRateLimit = require("@fastify/rate-limit");
const path = require('path');
require('dotenv').config();

async function buildServer() {
  fastify.register(swagger, {
    mode: 'static',
    specification: {
      path: path.join(__dirname, '../swagger.yaml'),
      postProcessor: (swaggerObject) => swaggerObject
    },
    openapi: {
      info: {
        title: 'Crypto Price Alert Service',
        version: '1.0.0',
      },
    },
  });
  fastify.register(swaggerUi, {
    routePrefix: '/docs',
    exposeRoute: true
  });

  console.error(process.env.JWT_SECRET)
  fastify.register(require('fastify-jwt'), {
    secret: process.env.JWT_SECRET || "biLira"
  });
  
  fastify.addHook('onRequest', async (request, reply) => {
    if (request.raw.url.startsWith('/alerts')) {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.code(401).send({ error: 'Unauthorized' });
      }
    }
  });

  fastify.register(fastifyHelmet);
  fastify.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  fastify.register(authRoutes, { prefix: "/auth" });
  fastify.register(alertRoutes, { prefix: "/alerts" });
  fastify.register(alertHistoryRoutes, { prefix: "/alerts" });

  await fastify.ready();
  return fastify;
}

async function startServer() {
  try {
    logger.info('Starting server...');
    await db.sequelize.authenticate();
    logger.info('DB connected.');

    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });
    logger.info("Redis client initialized.");

    const app = await buildServer();

    startCronJob();

    await app.listen({ port: 3000, host: process.env.HOST });
    logger.info('Server running on http://localhost:3000');
  } catch (err) {
    console.error(err);
    logger.error('Error starting server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = {
  buildServer,
};
