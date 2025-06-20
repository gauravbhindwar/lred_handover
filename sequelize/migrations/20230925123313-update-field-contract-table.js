'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('employee_contract', 'contractTemplateId', {
          type: Sequelize.INTEGER,
          allowNull: true,
        }, { transaction: t }),
        queryInterface.addColumn('employee_contract', 'description', {
          type: Sequelize.TEXT,
          allowNull: true,
        }, { transaction: t }),
        queryInterface.changeColumn('contract_template', 'clientId', {
          type: Sequelize.INTEGER,
          allowNull: true,
        }, { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'firstName', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'lastName', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'email', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'contactNumber', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'middleName', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'monthlySalary', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'address', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'dateOfBirth', { transaction: t }),
        queryInterface.removeConstraint('employee_contract','employee_contract_bonus_id_fk', { transaction:t }),
        queryInterface.removeColumn('employee_contract', 'bonusId', { transaction: t }),
        queryInterface.addConstraint('employee_contract', {
          type: 'foreign key',
          name: 'employee_contract_contractTemplate_id_fk',
          fields: ['contractTemplateId'],
          references: {
            table: 'contract_template',
            field: 'id',
          },
          transaction: t,
        }),
      ])
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeConstraint('employee_contract','employee_contract_contractTemplate_id_fk', { transaction:t }),
        queryInterface.removeColumn('employee_contract', 'contractTemplateId', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'description', { transaction: t }),
        queryInterface.changeColumn('contract_template', 'clientId', {
          type: Sequelize.INTEGER,
          allowNull: false,
        }, { transaction: t }),

        queryInterface.addColumn('employee_contract', 'firstName',
          {
            type: Sequelize.STRING,
            allowNull:true,
          }, { transaction: t }),
          queryInterface.addColumn('employee_contract', 'lastName',
          {
            type: Sequelize.STRING,
            allowNull:true,
          }, { transaction: t }),
          queryInterface.addColumn('employee_contract', 'email',
          {
            type: Sequelize.STRING,
            allowNull:true,
          }, { transaction: t }),
          queryInterface.addColumn('employee_contract', 'contactNumber',
          {
            type: Sequelize.STRING,
            allowNull:true,
          }, { transaction: t }),
          queryInterface.addColumn('employee_contract', 'middleName',
          {
            type: Sequelize.STRING,
            allowNull:true
          }, { transaction: t }),

          queryInterface.addColumn('employee_contract', 'monthlySalary',
          {
            type: Sequelize.FLOAT,
            allowNull:true
          }, { transaction: t }),

          queryInterface.addColumn('employee_contract', 'address',
          {
            type: Sequelize.STRING,
            allowNull:true
          }, { transaction: t }),

          queryInterface.addColumn('employee_contract', 'dateOfBirth',
          {
            type: Sequelize.DATE,
            allowNull:true
          }, { transaction: t }),
          queryInterface.addColumn('employee_contract', 'bonusId',
          {
            type: Sequelize.INTEGER,
            allowNull:true
          }, { transaction: t }),
          queryInterface.addConstraint('employee_contract', {
            type: 'foreign key',
            name: 'employee_contract_bonus_id_fk',
            fields: ['bonusId'],
            references: {
              table: 'bonus_type',
              field: 'id',
            },
            transaction: t,
          }),
      ])
    })
  }
};
