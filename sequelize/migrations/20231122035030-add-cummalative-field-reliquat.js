'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      return Promise.all([
        queryInterface.addColumn('reliquat_calculation', 'weekendBonus', {
          type: Sequelize.FLOAT,
          allowNull:true
        }, { transaction: t }),

        queryInterface.addColumn('reliquat_calculation', 'overtimeBonus', {
          type: Sequelize.FLOAT,
          allowNull:true
        }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('reliquat_calculation', 'weekendBonus', { transaction: t }),
        queryInterface.removeColumn('reliquat_calculation', 'overtimeBonus', { transaction: t }),
      ])
    })
  }
};
