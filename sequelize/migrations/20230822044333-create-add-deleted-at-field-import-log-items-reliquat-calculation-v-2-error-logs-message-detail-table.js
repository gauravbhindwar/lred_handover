'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('import_log_items', 'deletedAt',
          {
            type: Sequelize.DATE
          }, 
          { transaction: t }),
        queryInterface.addColumn('reliquat_calculation_v2', 'deletedAt',
          {
            type: Sequelize.DATE
          }, 
          { transaction: t }),
        queryInterface.addColumn('error_logs', 'deletedAt',
          {
            type: Sequelize.DATE
          }, 
          { transaction: t }),
        queryInterface.addColumn('message_detail', 'deletedAt',
          {
            type: Sequelize.DATE
          }, 
          { transaction: t }),
        queryInterface.addColumn('import_logs', 'deletedAt',
          {
            type: Sequelize.DATE
          }, 
          { transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('import_log_items', 'deletedAt', { transaction: t }),
        queryInterface.removeColumn('reliquat_calculation_v2', 'deletedAt', { transaction: t }),
        queryInterface.removeColumn('error_logs', 'deletedAt', { transaction: t }),
        queryInterface.removeColumn('message_detail', 'deletedAt', { transaction: t }),
        queryInterface.removeColumn('import_logs', 'deletedAt', { transaction: t }),
      ])
    })
  }
};
