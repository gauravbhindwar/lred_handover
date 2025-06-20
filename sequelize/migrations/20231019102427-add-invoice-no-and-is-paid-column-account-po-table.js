'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('account_po', 'invoiceNo', {
          allowNull:true,
          type: Sequelize.STRING,
        }, { transaction: t }),

        queryInterface.addColumn('account_po', 'isPaid', {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('account_po', 'invoiceNo', { transaction: t }),
        queryInterface.removeColumn('account_po', 'isPaid', { transaction: t }),
      ])
    })
  }
};