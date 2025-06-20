'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('reliquat_calculation', 'calculationDataJSON',
          {
            type: Sequelize.TEXT,
          }, { transaction: t }),
      ])
    }
    )
  },

  async down(queryInterface, _Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('reliquat_calculation', 'calculationDataJSON', { transaction: t }),
      ])
    })
  }
};