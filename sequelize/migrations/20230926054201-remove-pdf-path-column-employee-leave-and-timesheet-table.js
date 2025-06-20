'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('employee_leave', 'pdfPath', {
          type: Sequelize.STRING,
        }, { transaction: t }),
        queryInterface.removeColumn('timesheet', 'pdfPath', {
          type: Sequelize.STRING,
        }, { transaction: t }),
      ])
    })
  },
  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('employee_leave', 'pdfPath', {
          type: Sequelize.STRING,
        }, { transaction: t }),
        queryInterface.addColumn('timesheet', 'pdfPath', {
          type: Sequelize.STRING,
        }, { transaction: t }),
      ])
    })    
  }
};