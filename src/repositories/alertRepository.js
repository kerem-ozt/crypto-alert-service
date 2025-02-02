// src/repositories/alertRepository.js
const { Alert, User } = require('../models');

class AlertRepository {
  async createAlert(data) {
    const alert = await Alert.create(data);
    return alert;
  }

  async findAlertsByUserId1(userId) {
    return Alert.findAll({
      where: { userId },
      include: [{ model: User, attributes: ['email'] }],
    });
  }

  async findAlertsByUserId(userId, page = 1, perPage = 10) {
    const offset = (page - 1) * perPage;
    const limit = perPage;

    const { rows, count } = await Alert.findAndCountAll({
      where: { userId },
      include: [{ model: User, attributes: ['email'] }],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows,
      totalItems: count,
      currentPage: page,
      perPage,
      totalPages: Math.ceil(count / perPage),
    };
  }

  async findAlertByIdAndUserId(alertId, userId) {
    return Alert.findOne({ where: { id: alertId, userId } });
  }

  async deleteAlert(alert) {
    await alert.destroy();
  }
}

module.exports = new AlertRepository();
