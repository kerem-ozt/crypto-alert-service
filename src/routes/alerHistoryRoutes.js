const alertHistoryController = require('../controllers/alertHistoryController');

async function alertHistoryRoutes(fastify) {
  fastify.get('/:id/history', (req, reply) =>
    alertHistoryController.getAlertHistory(req, reply)
  );
}
module.exports = alertHistoryRoutes;
