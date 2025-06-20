'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'import_log_items',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          importLogId: { type: Sequelize.INTEGER, allowNull: false },
          description: { type: Sequelize.STRING, allowNull: false },
          status: { type: Sequelize.ENUM('OK','INFO'), allowNull: false, defaultValue: 'OK' },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER, allowNull: true },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction: t },
      );

      await queryInterface.addConstraint('import_log_items', {
        type: 'foreign key',
        name: 'import_log_items_importLog_id_fk',
        fields: ['importLogId'],
        references: {
          table: 'import_logs',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('import_log_items', {
        type: 'foreign key',
        name: 'import_log_items_created_by_fk',
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
      await queryInterface.dropTable('import_log_items', { transaction: t });
    });
  }
};
