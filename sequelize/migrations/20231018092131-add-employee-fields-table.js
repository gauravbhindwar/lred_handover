'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('employee', 'LREDContractEndDate', {
          allowNull:true,
          type: Sequelize.DATE,
        }, { transaction: t }),

        queryInterface.addColumn('employee', 'nextOfKin', {
          allowNull:true,
          type: Sequelize.STRING,
        }, { transaction: t }),

        queryInterface.addColumn('employee', 'catalogueNumber', {
          allowNull:true,
          type: Sequelize.STRING,
        }, { transaction: t }),
        
      ])
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('employee', 'LREDContractEndDate', {
          allowNull:true,
          type: Sequelize.DATE,
        }, { transaction: t }),

        queryInterface.removeColumn('employee', 'nextOfKin', {
          allowNull:true,
          type: Sequelize.STRING,
        }, { transaction: t }),

        queryInterface.removeColumn('employee', 'catalogueNumber', {
          allowNull:true,
          type: Sequelize.STRING,
        }, { transaction: t }),
       
      ])
    })
  }
};