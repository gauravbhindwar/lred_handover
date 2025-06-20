'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('employee_leave', 'leaveType',
          {
            type: Sequelize.STRING,
          }, { transaction: t }),

        queryInterface.addColumn('employee_leave', 'description',
          {
            type: Sequelize.STRING,
          }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('employee_leave', 'leaveType', { transaction: t }),
        queryInterface.removeColumn('employee_leave', 'description', { transaction: t }),
      ])
    })
  }
};
