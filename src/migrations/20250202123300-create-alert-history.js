'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AlertHistories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      alertId: {
        type: Sequelize.INTEGER,
        references: { model: "Alerts", key: "id" },
        onDelete: "CASCADE",
        allowNull: false,
      },
      triggeredAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      notificationSent: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      message: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AlertHistories');
  }
};