'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      return Promise.all([
        queryInterface.addColumn('timesheet', 'oldTimesheetId', {
          allowNull:true,
          type: Sequelize.STRING,
        }, { transaction: t }),
        queryInterface.addColumn('timesheet', 'unApprovedBy', {
          allowNull:true,
          type: Sequelize.INTEGER,
        }, { transaction: t }),
        queryInterface.addColumn('timesheet', 'unApprovedAt', {
          allowNull:true,
          type: Sequelize.DATE,
        }, { transaction: t }),
        queryInterface.addConstraint('timesheet', {
          type: 'foreign key',
          name: 'timesheet_unapproved_by_fk',
          fields: ['unApprovedBy'],
          references: {
            table: 'users',
            field: 'id',
          },
          transaction: t,
        })
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('timesheet', 'oldTimesheetId', { transaction: t }),
        queryInterface.removeColumn('timesheet', 'unApprovedBy', { transaction: t }), 
        queryInterface.removeColumn('timesheet', 'unApprovedAt', { transaction: t }),
        queryInterface.removeConstraint('timesheet','unApprovedBy', { transaction: t })
      ])
    })
  }
};