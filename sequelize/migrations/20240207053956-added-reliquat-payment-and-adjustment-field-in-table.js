'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      return Promise.all([
        queryInterface.addColumn('reliquat_calculation', 'reliquatPaymentValue', {
          type: Sequelize.FLOAT,
          allowNull:true
        }, { transaction: t }),
        queryInterface.addColumn('reliquat_calculation', 'reliquatAdjustmentValue', {
          type: Sequelize.FLOAT,
          allowNull:true
        }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('reliquat_calculation', 'reliquatPaymentValue', { transaction: t }),
        queryInterface.removeColumn('reliquat_calculation', 'reliquatAdjustmentValue', { transaction: t }),
      ])
    })
  }
};