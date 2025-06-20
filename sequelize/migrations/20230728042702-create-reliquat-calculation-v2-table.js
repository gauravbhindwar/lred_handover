'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'reliquat_calculation_v2',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          clientId: { type: Sequelize.INTEGER, allowNull: false },
          timesheetId: { type: Sequelize.INTEGER, allowNull: false },
          employeeId: { type: Sequelize.INTEGER, allowNull: false },
          taken: { type: Sequelize.FLOAT, allowNull: true },
          presentDay: { type: Sequelize.FLOAT, allowNull: true },
          earned: { type: Sequelize.FLOAT, allowNull: true },
          earnedTaken: { type: Sequelize.FLOAT, allowNull: true },
          totalWorked: { type: Sequelize.FLOAT, allowNull: true },
          weekend: { type: Sequelize.FLOAT, allowNull: true },
          overtime: { type: Sequelize.FLOAT, allowNull: true },
          adjustment: { type: Sequelize.FLOAT, allowNull: true },
          reliquatPayment: { type: Sequelize.FLOAT, allowNull: true },
          reliquat: { type: Sequelize.FLOAT, allowNull: true },
          startDate: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          endDate: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction: t },
      );

      await queryInterface.addConstraint('reliquat_calculation_v2', {
        type: 'foreign key',
        name: 'reliquat_calculation_v2_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('reliquat_calculation_v2', {
        type: 'foreign key',
        name: 'reliquat_calculation_v2_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('reliquat_calculation_v2', {
        type: 'foreign key',
        name: 'reliquat_calculation_v2_employee_id_fk',
        fields: ['employeeId'],
        references: {
          table: 'employee',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('reliquat_calculation_v2', {
        type: 'foreign key',
        name: 'reliquat_calculation_v2_timesheet_id_fk',
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
      await queryInterface.dropTable('reliquat_calculation_v2', { transaction: t });
    });
  }
};
