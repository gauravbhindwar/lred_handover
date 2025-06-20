'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('employee', 'oldEmployeeId',
          {
            type: Sequelize.STRING
          }, 
          { transaction: t }),
      ])
      }
    )
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('employee', 'oldEmployeeId', { transaction: t }),
      ])
    })
  }
};
