'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn('segment', 'vatRate', { type: Sequelize.FLOAT, allowNull: true }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn('segment', 'vatRate', { type: Sequelize.INTEGER, allowNull: true }, { transaction: t }),
      ])
    })
  }
};
