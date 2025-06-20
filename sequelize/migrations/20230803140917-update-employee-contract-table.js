'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
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
          
      ])
    }
    )
  },

  async down(queryInterface, _Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('employee_contract', 'firstName', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'lastName', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'email', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'contactNumber', { transaction: t }),
      ])
    })
  }
};