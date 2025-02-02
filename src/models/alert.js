'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Alert extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Alert.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Alert.init({
    userId: DataTypes.INTEGER,
    symbol: DataTypes.STRING,
    conditionType: DataTypes.STRING, // 'above', 'below', 'range', 'percentage_drop'
    threshold: DataTypes.FLOAT,      
    rangeLow: DataTypes.FLOAT,       
    rangeHigh: DataTypes.FLOAT,      
    percentChange: DataTypes.FLOAT,  
    timeWindow: DataTypes.STRING,  
    isActive: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Alert',
    tableName: "Alerts",
    indexes: [
      {
        name: "idx_alert_userId",  
        fields: ["userId"],
      },
      {
        name: "idx_alert_symbol",
        fields: ["symbol"],
      },
    ],
  });
  return Alert;
};