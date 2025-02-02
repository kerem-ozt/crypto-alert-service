const alertController = require('../controllers/alertController');

async function alertRoutes(fastify) {
  fastify.post('/', (req, reply) => alertController.createAlert(req, reply));
  fastify.get('/', (req, reply) => alertController.listAlerts(req, reply));
  fastify.delete('/:id', (req, reply) => alertController.deleteAlert(req, reply));
}

module.exports = alertRoutes;