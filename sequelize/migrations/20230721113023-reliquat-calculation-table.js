'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'reliquat_calculation',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          clientId: { type: Sequelize.INTEGER, allowNull: false },
          timesheetId: { type: Sequelize.INTEGER, allowNull: false },
          employeeId: { type: Sequelize.INTEGER, allowNull: false },
          leave: { type: Sequelize.FLOAT, allowNull: true },
          presentDay: { type: Sequelize.FLOAT, allowNull: true },
          totalTakenLeave: { type: Sequelize.FLOAT, allowNull: true },
          earned: { type: Sequelize.FLOAT, allowNull: true },
          totalWorked: { type: Sequelize.FLOAT, allowNull: true },
          weekend: { type: Sequelize.FLOAT, allowNull: true },
          overtime: { type: Sequelize.FLOAT, allowNull: true },
          reliquat: { type: Sequelize.FLOAT, allowNull: true },
          calculation: { type: Sequelize.FLOAT, allowNull: true },
          startDate: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          endDate: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction: t },
      );

      await queryInterface.addConstraint('reliquat_calculation', {
        type: 'foreign key',
        name: 'reliquat_calculation_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('reliquat_calculation', {
        type: 'foreign key',
        name: 'reliquat_calculation_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('reliquat_calculation', {
        type: 'foreign key',
        name: 'reliquat_calculation_employee_id_fk',
        fields: ['employeeId'],
        references: {
          table: 'employee',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('reliquat_calculation', {
        type: 'foreign key',
        name: 'reliquat_calculation_timesheet_id_fk',
        fields: ['timesheetId'],
        references: {
          table: 'timesheet',
          field: 'id',
        },
        transaction: t,
      });
    });
  },

  async down (queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('reliquat_calculation', { transaction: t });
    });
  }
};
