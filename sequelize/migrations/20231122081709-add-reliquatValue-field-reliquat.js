'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      return Promise.all([
        queryInterface.addColumn('reliquat_calculation', 'reliquatValue', {
          type: Sequelize.FLOAT,
          allowNull:true
        }, { transaction: t }),
        queryInterface.addColumn('reliquat_calculation_v2', 'reliquatValue', {
          type: Sequelize.FLOAT,
          allowNull:true
        }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('reliquat_calculation', 'reliquatValue', { transaction: t }),
        queryInterface.removeColumn('reliquat_calculation_v2', 'reliquatValue', { transaction: t }),
      ])
    })
  }
};
