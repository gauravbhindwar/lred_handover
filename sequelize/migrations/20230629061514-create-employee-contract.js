'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'employee_contract',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true },
          employeeId: { type: Sequelize.INTEGER, allowNull: false },
          contractVersionId: { type: Sequelize.INTEGER, allowNull: false },
          newContractNumber: { type: Sequelize.INTEGER, allowNull: true },
          startDate: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          endDate: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
      await queryInterface.addConstraint('employee_contract', {
        type: 'foreign key',
        name: 'employee_contract_client_id_fk',
        fields: ['contractVersionId'],
        references: {
          table: 'contract_template_version',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('employee_contract', {
        type: 'foreign key',
        name: 'employee_contract_table_created_by_fk',
        fields: ['employeeId'],
        references: {
          table: 'employee',
          field: 'id',
        },
        transaction: t,
      });
      
      await queryInterface.addConstraint('employee_contract', {
        type: 'foreign key',
        name: 'employee_contract_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee_contract', {
        type: 'foreign key',
        name: 'employee_contract_updated_by_fk',
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
      await queryInterface.dropTable('employee_contract', { transaction: t });
    });
  }
};
