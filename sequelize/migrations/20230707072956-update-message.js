'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('message', 'scheduleDate',
          {
            type: Sequelize.DATE,
          }, { transaction: t }),

          queryInterface.addColumn('message', 'isSchedule',
          {
            type: Sequelize.BOOLEAN, defaultValue: false
          }, { transaction: t }),
      ])
    }
    )
  },

  async down(queryInterface, _Sequelize) {
    return queryInterface.sequelize.transaction((t) => {

      return Promise.all([
        queryInterface.removeColumn('message', 'scheduleDate', { transaction: t }),
        queryInterface.removeColumn('message', 'isSchedule', { transaction: t }),
      ])
    })
  }
};
