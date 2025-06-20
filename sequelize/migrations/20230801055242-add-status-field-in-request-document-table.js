'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('request_document', 'status',
          {
            type: Sequelize.ENUM('ACTIVE', 'DECLINED'), allowNull: true ,
          }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('request_document', 'status', { transaction: t }),
      ])
    })
  }
};
