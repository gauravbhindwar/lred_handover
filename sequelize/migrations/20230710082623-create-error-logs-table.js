'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'error_logs',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          clientId: { type: Sequelize.INTEGER, allowNull: true },
          type: { type: Sequelize.STRING, allowNull: false },
          email:{ type: Sequelize.STRING, allowNull: false },
          error_message: { type: Sequelize.STRING, allowNull: false },
          full_error:{ type: Sequelize.STRING, allowNull: true },
          isActive: { type: Sequelize.ENUM('ACTIVE','ISACTIVE'), allowNull: false, defaultValue: 'ACTIVE' },
          status: { type: Sequelize.ENUM('SENT','ERROR'), allowNull: false, defaultValue: 'ERROR' },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER, allowNull: true },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction: t },
      );

      await queryInterface.addConstraint('error_logs', {
        type: 'foreign key',
        name: 'error_logs_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('error_logs', {
        type: 'foreign key',
        name: 'error_logs_created_by_fk',
        fields: ['createdBy'],
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
      await queryInterface.dropTable('error_logs', { transaction: t });
    });
  }
};
