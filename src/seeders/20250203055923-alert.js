'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert("Alerts", [
      {
        userId: 1,
        symbol: "BTC",
        conditionType: "above",
        threshold: 30000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 1,
        symbol: "BTC",
        conditionType: "below",
        threshold: 20000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 2,
        symbol: "ETH",
        conditionType: "range",
        rangeLow: 1000,
        rangeHigh: 1500,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 2,
        symbol: "BTC",
        conditionType: "percentage_drop",
        percentChange: 10,
        timeWindow: "30-12-2024",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Alerts", null, {});
  }
};
