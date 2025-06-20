'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'smtp',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          port: { type: Sequelize.INTEGER, allowNull: false },
          host: { type: Sequelize.STRING },
          secure: { type: Sequelize.BOOLEAN, defaultValue: true },
          username: { type: Sequelize.STRING },
          password: { type: Sequelize.STRING },
          isDefault: { type: Sequelize.BOOLEAN, defaultValue: true },
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
      await queryInterface.dropTable('smtp', { transaction: t });
    });
  }
};
