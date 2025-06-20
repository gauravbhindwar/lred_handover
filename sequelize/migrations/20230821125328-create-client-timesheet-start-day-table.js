'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'client_timesheet_start_day',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          clientId: { type: Sequelize.INTEGER, allowNull: true },
          timesheetStartDay: { type: Sequelize.INTEGER, allowNull: false },
          date: { type: Sequelize.DATE, allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
      await queryInterface.addConstraint('client_timesheet_start_day', {
        type: 'foreign key',
        name: 'client_timesheet_start_day_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('client_timesheet_start_day', {
        type: 'foreign key',
        name: 'client_timesheet_start_day_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('client_timesheet_start_day', {
        type: 'foreign key',
        name: 'client_timesheet_start_day_updated_by_fk',
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
      await queryInterface.dropTable('client_timesheet_start_day', { transaction: t });
    });
  }
};
