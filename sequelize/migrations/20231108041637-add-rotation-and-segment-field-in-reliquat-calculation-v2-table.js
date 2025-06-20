'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      return Promise.all([
        queryInterface.addColumn('reliquat_calculation_v2', 'rotationName', {
          type: Sequelize.STRING,
        }, { transaction: t }),
        queryInterface.addColumn('reliquat_calculation_v2', 'segmentName', {
          type: Sequelize.STRING,
        }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('reliquat_calculation_v2', 'rotationName', { transaction: t }),
        queryInterface.removeColumn('reliquat_calculation_v2', 'segmentName', { transaction: t }), 
      ])
    })
  }
};
