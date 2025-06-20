'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      return Promise.all([
        queryInterface.addColumn('segment', 'isActive', {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        }, { transaction: t }),
        queryInterface.addColumn('sub_segment', 'isActive', {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('segment', 'isActive', { transaction: t }),
        queryInterface.removeColumn('sub_segment', 'isActive', { transaction: t }),
      ])
    })
  }
};
