'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AlertHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      AlertHistory.belongsTo(models.Alert, { foreignKey: "alertId" });
      // define association here
    }
  }
  AlertHistory.init({
    alertId: DataTypes.INTEGER,
    triggeredAt: DataTypes.DATE,
    notificationSent: DataTypes.BOOLEAN,
    message: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'AlertHistory',
    tableName: "AlertHistories",
  });
  return AlertHistory;
};