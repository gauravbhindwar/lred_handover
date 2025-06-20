'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'user_permission',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          permissionId: { type: Sequelize.INTEGER, allowNull: false },
          userId: { type: Sequelize.INTEGER, allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
      await queryInterface.addConstraint('user_permission', {
        type: 'foreign key',
        name: 'user_permission_permission_id_fk',
        fields: ['permissionId'],
        references: {
          table: 'permission',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('user_permission', {
        type: 'foreign key',
        name: 'user_permission_user_id_fk',
        fields: ['userId'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('user_permission', {
        type: 'foreign key',
        name: 'user_permission_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('user_permission', {
        type: 'foreign key',
        name: 'user_permission_updated_by_fk',
        fields: ['updatedBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
    });
  },

  async down (queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('user_permission', { transaction: t });
    });
  }
};
