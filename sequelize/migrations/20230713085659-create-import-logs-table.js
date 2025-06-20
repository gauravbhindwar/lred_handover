'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'import_logs',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          clientId: { type: Sequelize.INTEGER, allowNull: false },
          fileName: { type: Sequelize.STRING, allowNull: false },
          rowNo:{ type: Sequelize.INTEGER, allowNull: false },
          startDate: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          endDate: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER, allowNull: true },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction: t },
      );

      await queryInterface.addConstraint('import_logs', {
        type: 'foreign key',
        name: 'import_logs_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('import_logs', {
        type: 'foreign key',
        name: 'import_logs_created_by_fk',
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
      await queryInterface.dropTable('import_logs', { transaction: t });
    });
  }
};
