'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('employee', 'employeeStatus',
          {
            type: Sequelize.ENUM('SAVED', 'DRAFT'), allowNull: false, defaultValue: 'SAVED',
          }, 
          { transaction: t }),
      ])
    }
    )
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('employee', 'employeeStatus', { transaction: t }),
      ])
    })
  }
};
