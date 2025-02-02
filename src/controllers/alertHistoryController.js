const { AlertHistory, Alert } = require('../models');

class AlertHistoryController {
  async getAlertHistory(req, reply) {
    try {
      const alertId = req.params.id;
      const histories = await AlertHistory.findAll({
        where: { alertId },
        order: [['triggeredAt', 'DESC']],
      });
      return reply.send(histories);
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }
}

module.exports = new AlertHistoryController();
