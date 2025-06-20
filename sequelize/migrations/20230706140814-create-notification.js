'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async () => {
      await queryInterface.createTable(
        'notifications',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          title: { type: Sequelize.STRING },
          message: { type: Sequelize.TEXT },
          isRead: { type: Sequelize.BOOLEAN },
          userId: { type: Sequelize.INTEGER },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          deletedAt: { type: Sequelize.DATE },
        },
      );
      await queryInterface.addConstraint('notifications', {
        type: 'foreign key',
        name: 'user_notifications_fk',
        fields: ['userId'],
        references: {
          table: 'users',
          field: 'id',
        },
      });
    });


  },

  async down(queryInterface, _) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('notifications', { transaction: t });
    });
  },
};
