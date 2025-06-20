'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      return Promise.all([
        queryInterface.addColumn('employee_contract', 'workOrderNumber', {
          type: Sequelize.TEXT,
          allowNull:true
        }, { transaction: t }),
        queryInterface.addColumn('employee_contract', 'remuneration', {
          type: Sequelize.INTEGER,
          allowNull:true
        }, { transaction: t }),
        queryInterface.addColumn('employee_contract', 'uniqueWorkNumber', {
          type: Sequelize.INTEGER,
          allowNull:true
        }, { transaction: t }),
        queryInterface.addColumn('employee_contract', 'workCurrency', {
          type: Sequelize.TEXT,
          allowNull:true
        }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('employee_contract', 'workOrderNumber', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'remuneration', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'uniqueWorkNumber', { transaction: t }),
        queryInterface.removeColumn('employee_contract', 'workCurrency', { transaction: t }),
      ])
    })
  }
};