'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('timesheet_schedule', 'bonusCode', {
          allowNull:true,
          type: Sequelize.STRING,
        }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('timesheet_schedule', 'bonusCode', { transaction: t }),
      ])
    })
  }
};