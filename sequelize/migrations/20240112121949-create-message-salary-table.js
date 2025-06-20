'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'message_salary',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          employeeId: { type: Sequelize.INTEGER, allowNull: true },
          clientId: { type: Sequelize.INTEGER, allowNull: true },
          managerUserId: { type: Sequelize.INTEGER, allowNull: true },
          message:{type: Sequelize.STRING,allowNull: true},
          phone:{type: Sequelize.STRING,allowNull: true},
          email:{type: Sequelize.STRING,allowNull: true},
          bonusPrice:{type: Sequelize.FLOAT,allowNull: true},
          monthlySalary:{type: Sequelize.FLOAT,allowNull: false},
          total: {type: Sequelize.FLOAT,allowNull: false},
          salaryDate: { type: Sequelize.DATE, allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
      await queryInterface.addConstraint('message_salary', {
        type: 'foreign key',
        name: 'message_salary_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('message_salary', {
        type: 'foreign key',
        name: 'message_salary_updated_by_fk',
        fields: ['updatedBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('message_salary', {
        type: 'foreign key',
        name: 'message_salary_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });
    });
  },

  async down (queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('message_salary', { transaction: t });
    });
  }
};