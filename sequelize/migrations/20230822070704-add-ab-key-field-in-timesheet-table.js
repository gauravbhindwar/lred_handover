'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface,Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('timesheet', 'dbKey',
        {
          type: Sequelize.STRING,
        }, { transaction: t }),
        queryInterface.addIndex('timesheet', {
          name: 'timesheet_unique_dbKey_uk',
          fields: ['dbKey'],
          unique: true,
          where: {
            deletedAt: null,
          },
          transaction: t,
        }),
      ])
    })
  },
  
  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('timesheet', 'dbKey', { transaction: t }),
      ])
    })
  }
};
