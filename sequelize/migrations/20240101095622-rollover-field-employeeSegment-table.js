'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('employee_segment', 'rollover',
          {
            type: Sequelize.BOOLEAN,
            defaultValue:false,
            allowNull:true
          }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('employee_segment', 'rollover', { transaction: t }),
      ])
    })
  }
};