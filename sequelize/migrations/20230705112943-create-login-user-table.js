'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'login_user',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          email: { type: Sequelize.STRING },
          firstName: { type: Sequelize.STRING },
          lastName: { type: Sequelize.STRING },
          name: { type: Sequelize.STRING },
          password: { type: Sequelize.STRING },
          randomPassword: { type: Sequelize.STRING },
          birthDate: { type: Sequelize.DATE },
          placeOfBirth: { type: Sequelize.STRING },
          gender: { type: Sequelize.STRING },
          code: { type: Sequelize.STRING },
          phone: { type: Sequelize.STRING },
          profileImage: { type: Sequelize.STRING },
          timezone: { type: Sequelize.STRING },
          isMailNotification: { type: Sequelize.BOOLEAN },
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
      await queryInterface.dropTable('login_user', { transaction: t });
    });
  }
};