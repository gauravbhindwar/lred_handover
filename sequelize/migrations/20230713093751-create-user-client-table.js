'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'user_client',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          userId: { type: Sequelize.INTEGER, allowNull: false },
          clientId: { type: Sequelize.INTEGER, allowNull: false },
          roleId: { type: Sequelize.INTEGER, allowNull: false },
          status: { type: Sequelize.ENUM('ACTIVE', 'INACTIVE'), allowNull: false, defaultValue: 'ACTIVE' },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
      await queryInterface.addConstraint('user_client', {
        type: 'foreign key',
        name: 'user_client_login_user_id_fk',
        fields: ['userId'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('user_client', {
        type: 'foreign key',
        name: 'user_client_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('user_client', {
        type: 'foreign key',
        name: 'user_client_role_id_fk',
        fields: ['roleId'],
        references: {
          table: 'role',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('user_client', {
        type: 'foreign key',
        name: 'user_client_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('user_client', {
        type: 'foreign key',
        name: 'user_client_updated_by_fk',
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
      await queryInterface.dropTable('user_client', { transaction: t });
    });
  }
};
