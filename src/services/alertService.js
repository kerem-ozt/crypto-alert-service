const alertRepository = require('../repositories/alertRepository');

class AlertService {
  async createAlertForUser(userId, symbol, conditionType, threshold, rangeHigh, rangeLow, percentChange, timeWindow) {
    const newAlert = await alertRepository.createAlert({
      userId,
      symbol,
      conditionType,
      threshold,
      rangeHigh,
      rangeLow,
      percentChange,
      timeWindow,
      isActive: true,
    });
    return newAlert;
  }

  async listUserAlerts(userId, page, perPage) {
    return alertRepository.findAlertsByUserId(userId, page, perPage);
  }

  async deleteAlert(alertId, userId) {
    const alert = await alertRepository.findAlertByIdAndUserId(alertId, userId);
    if (!alert) {
      throw new Error('Alert not found');
    }
    await alertRepository.deleteAlert(alert);
    return { message: 'Alert deleted successfully' };
  }
}

module.exports = new AlertService();
