'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('account', 'poNumberBonus1', {
          allowNull:true,
          type: Sequelize.STRING,
        }, { transaction: t }),
        queryInterface.addColumn('account', 'poNumberBonus2', {
          allowNull:true,
          type: Sequelize.STRING,
        }, { transaction: t }),
        queryInterface.addColumn('account', 'poNumberBonus3', {
          allowNull:true,
          type: Sequelize.STRING,
        }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('account', 'poNumberBonus1', { transaction: t }),
        queryInterface.removeColumn('account', 'poNumberBonus2', { transaction: t }),
        queryInterface.removeColumn('account', 'poNumberBonus3', { transaction: t }),
      ])
    })
  }
};
