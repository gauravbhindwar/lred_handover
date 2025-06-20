'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('message', 'errorMessage', {
          type: Sequelize.STRING,
          allowNull:true
        }, { transaction: t }),
        
      ])
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('message', 'errorMessage', {
          type: Sequelize.STRING,
          allowNull:true
        }, { transaction: t }),
       
      ])
    })
  }
};