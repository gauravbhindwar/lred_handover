'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeIndex('client','unique_code_uk', { transaction:t }),
        queryInterface.addColumn('client', 'isShowSegmentName',
          {
            type: Sequelize.BOOLEAN, defaultValue: false
          }, 
          { transaction: t }),
        queryInterface.addColumn('client', 'oldClientId',
          {
            type: Sequelize.STRING
          }, 
          { transaction: t }),
      ])
      }
    )
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addIndex('client', {
          name: 'unique_code_uk',
          fields: ['code'],
          unique: true,
          where: {
            deletedAt: null,
          },
          transaction: t,
        }),
        queryInterface.removeColumn('client', 'isShowSegmentName', { transaction: t }),
        queryInterface.removeColumn('client', 'oldClientId', { transaction: t }),
      ])
    })
  }
};
