'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'timesheet_schedule',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          employeeId: { type: Sequelize.INTEGER, allowNull: false },
          status: { type: Sequelize.STRING, allowNull: true},
          date: { type: Sequelize.DATE, allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
      await queryInterface.addConstraint('timesheet_schedule', {
        type: 'foreign key',
        name: 'timesheet_employee_id_fk',
        fields: ['employeeId'],
        references: {
          table: 'employee',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('timesheet_schedule', {
        type: 'foreign key',
        name: 'timesheet_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('timesheet_schedule', {
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
      await queryInterface.dropTable('timesheet_schedule', { transaction: t });
    });
  }
};
