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
    await queryInterface.bulkInsert("AlertHistories", [
      {
        alertId: 1,
        triggeredAt: new Date("2025-02-01T10:00:00Z"), 
        notificationSent: true,
        message: "BTC above 30000 triggered at price=30500",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        alertId: 2,
        triggeredAt: new Date("2025-02-01T12:00:00Z"),
        notificationSent: true,
        message: "BTC below 20000 triggered at price=19500",
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
    await queryInterface.bulkDelete("AlertHistories", null, {});
  }
};
