'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'otp',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          otp: { type: Sequelize.INTEGER },
          type: {
            type: Sequelize.STRING,
            defaultValue: 'REGISTER',
            type: Sequelize.ENUM('REGISTER', 'FORGOT')
          },
          expired: { type: Sequelize.STRING },
          email: { type: Sequelize.STRING },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
    });

  },

  async down (queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('otp', { transaction: t });
    });

  }
};
