'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn('contract_template_version', 'description', {
          type: Sequelize.TEXT,
          allowNull: false,
        }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn('contract_template_version', 'description', {
          type: Sequelize.STRING,
          allowNull: false,
        }, { transaction: t }),
      ])
    })
  }
};
