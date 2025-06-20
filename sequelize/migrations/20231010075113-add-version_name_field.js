'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('contract_template_version', 'versionName', {
          allowNull:true,
          type: Sequelize.STRING,
        }, { transaction: t }),
        
      ])
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('contract_template_version', 'versionName', {
          allowNull:true,
          type: Sequelize.STRING,
        }, { transaction: t }),
       
      ])
    })
  }
};
