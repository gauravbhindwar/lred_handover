'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('users', 'randomPassword',
          {
            type: Sequelize.TEXT
          }, 
          { transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('users', 'randomPassword', { transaction: t }),
      ])
    })
  }
};
