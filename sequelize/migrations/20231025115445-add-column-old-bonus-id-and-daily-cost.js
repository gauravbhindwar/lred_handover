'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('bonus_type', 'dailyCost',
          {
            type: Sequelize.FLOAT
          }, 
          { transaction: t }),
        queryInterface.changeColumn('bonus_type', 'basePrice', { type: Sequelize.FLOAT, allowNull: true }, { transaction: t }),
      ])
      }
    )
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('bonus_type', 'dailyCost', { transaction: t }),
        queryInterface.changeColumn('bonus_type', 'basePrice', { type: Sequelize.INTEGER, allowNull: true }, { transaction: t }),
      ])
    })
  }
};
