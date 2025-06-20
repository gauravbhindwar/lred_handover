'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'role_permission',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          permissionId: { type: Sequelize.INTEGER, allowNull: false },
          roleId: { type: Sequelize.INTEGER, allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
      await queryInterface.addConstraint('role_permission', {
        type: 'foreign key',
        name: 'role_permission_permission_id_fk',
        fields: ['permissionId'],
        references: {
          table: 'permission',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('role_permission', {
        type: 'foreign key',
        name: 'role_permission_role_id_fk',
        fields: ['roleId'],
        references: {
          table: 'role',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('role_permission', {
        type: 'foreign key',
        name: 'role_permission_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('role_permission', {
        type: 'foreign key',
        name: 'role_permission_updated_by_fk',
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
      await queryInterface.dropTable('role_permission', { transaction: t });
    });
  }
};
