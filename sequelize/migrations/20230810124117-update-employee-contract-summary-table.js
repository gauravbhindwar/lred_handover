'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
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
    }
    )
  },

  async down(queryInterface, _Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('employee_contract', 'middleName', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'monthlySalary', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'address', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'dateOfBirth', { transaction: t }),
        queryInterface.removeConstraint('employee_contract','employee_contract_bonus_id_fk', { transaction:t }),
        queryInterface.removeColumn('employee_contract', 'bonusId', { transaction: t }),
      ])
    })
  }
};


