'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      return Promise.all([
        queryInterface.addColumn('client', 'contractN', {
          type: Sequelize.STRING,
          allowNull:true
        }, { transaction: t }),
        queryInterface.addColumn('client', 'contractTagline', {
          type: Sequelize.STRING,
          allowNull:true
        }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('client', 'contractN', { transaction: t }),
        queryInterface.removeColumn('client', 'contractTagline', { transaction: t }),
      ])
    })
  }
};
