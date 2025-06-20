'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'timesheet_logs',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          timesheetId: {type: Sequelize.INTEGER},
          status: { type: Sequelize.ENUM('APPROVED', 'UNAPPROVED'), allowNull: true},
          actionDate: { type: Sequelize.DATE, allowNull: true },
          actionBy: { type: Sequelize.INTEGER },
          createdAt: { type: Sequelize.DATE, allowNull: true, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: true },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
      await queryInterface.addConstraint('timesheet_logs', {
        type: 'foreign key',
        name: 'timesheet_timesheet_id_fk',
        fields: ['timesheetId'],
        references: {
          table: 'timesheet',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('timesheet_logs', {
        type: 'foreign key',
        name: 'timesheet_action_by_fk',
        fields: ['actionBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('timesheet_logs', {
        type: 'foreign key',
        name: 'timesheet_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('timesheet_logs', {
        type: 'foreign key',
        name: 'timesheet_updated_by_fk',
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
      await queryInterface.dropTable('timesheet_logs', { transaction: t });
    });
  }
};
