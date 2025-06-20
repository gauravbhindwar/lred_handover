'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('employee', 'isAdminApproved',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: true,
          }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('employee', 'isAdminApproved', { transaction: t }),
      ])
    })
  }
};
