'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('medical_type', 'daysExpiry',
          {
            type: Sequelize.INTEGER,
          }, { transaction: t }),
      ])
    }
    )
  },

  async down(queryInterface, _Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('medical_type', 'daysExpiry', { transaction: t }),
      ])
    })
  }
};
