'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'employee_bonus',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          employeeId: { type: Sequelize.INTEGER, allowNull: false },
          bonusId: { type: Sequelize.INTEGER, allowNull: false },
          price: { type: Sequelize.FLOAT, allowNull: false },
          coutJournalier: { type: Sequelize.FLOAT, allowNull: false },
          startDate: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          catalogueNumber: { type: Sequelize.STRING, allowNull: true },
          endDate: { type: Sequelize.DATE, allowNull: true },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE }
        },
        { transaction: t },
      );

      await queryInterface.addConstraint('employee_bonus', {
        type: 'foreign key',
        name: 'employee_bonus_employee_id_fk',
        fields: ['employeeId'],
        references: {
          table: 'employee',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee_bonus', {
        type: 'foreign key',
        name: 'employee_bonus_bonus_id_fk',
        fields: ['bonusId'],
        references: {
          table: 'bonus_type',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee_bonus', {
        type: 'foreign key',
        name: 'employee_bonus_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee_bonus', {
        type: 'foreign key',
        name: 'employee_bonus_updated_by_fk',
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
      await queryInterface.dropTable('employee_bonus', { transaction: t });
    });
  }
};
