'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('timesheet_schedule', 'isLeaveForTitreDeConge',
          {
            type: Sequelize.BOOLEAN,
            defaultValue:false,
            allowNull: true,
          }, { transaction: t }),

      ])
    }
    )
  },

  async down(queryInterface, _Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('timesheet_schedule', 'isLeaveForTitreDeConge', { transaction: t }),
      ])
    })
  }
};