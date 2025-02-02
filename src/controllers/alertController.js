const alertService = require('../services/alertService');
const { createAlertSchema } = require('../validations/alerValidation');

class AlertController {
  async createAlert(req, reply) {
    try {
      const userId = req.user.id;
      const { symbol, conditionType, threshold, rangeHigh, rangeLow, percentChange, timeWindow } = req.body;

      const { error, value } = createAlertSchema.validate({
        symbol,
        conditionType,
        threshold,
        rangeHigh,
        rangeLow,
        percentChange,
        timeWindow
      });
      if (error) {
        return reply.code(400).send({ error: error.details[0].message });
      }

      const newAlert = await alertService.createAlertForUser(
        userId,
        value.symbol,
        value.conditionType,
        value.threshold,
        value.rangeHigh,
        value.rangeLow,
        value.percentChange,
        value.timeWindow
      );
      return reply.code(201).send(newAlert);

    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }

  async listAlerts(req, reply) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page || '1', 10);
      const perPage = parseInt(req.query.perPage || '10', 10);

      const result = await alertService.listUserAlerts(userId, page, perPage);
      return reply.code(200).send(result);

    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }

  async deleteAlert(req, reply) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await alertService.deleteAlert(id, userId);
      return reply.code(200).send({ message: 'Alert deleted successfully' });
    } catch (err) {
      if (err.message === 'Alert not found') {
        return reply.code(404).send({ error: 'Alert not found' });
      }
      req.log.error(err);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  }
}

module.exports = new AlertController();