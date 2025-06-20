'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn('employee', 'customBonus', {
          type: Sequelize.TEXT,
          allowNull: true,
        }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn('employee', 'customBonus', {
          type: Sequelize.STRING,
          allowNull: true,
        }, { transaction: t }),
      ])
    })
  }
};
