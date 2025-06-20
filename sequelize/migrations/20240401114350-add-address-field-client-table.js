'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      return Promise.all([
        queryInterface.addColumn('client', 'address', {
          type: Sequelize.TEXT,
          allowNull:true
        }, { transaction: t }),
        queryInterface.addColumn('client', 'currency', {
          type: Sequelize.STRING,
          allowNull:true
        }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('client', 'address', { transaction: t }),
        queryInterface.removeColumn('client', 'currency', { transaction: t }),
      ])
    })
  }
};