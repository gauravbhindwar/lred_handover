'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('login_user', 'uniqueLoginId', {
          type: Sequelize.STRING,
          allowNull: true
        }, { transaction: t }),
        queryInterface.addIndex('login_user', {
          name: 'unique_uniqueLoginId_uk',
          fields: ['uniqueLoginId'],
          unique: true,
          where: {
            deletedAt: null,
          },
          transaction: t,
        })
      ])
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('login_user', 'uniqueLoginId', {
          type: Sequelize.STRING,
        }, { transaction: t }),
      ])
    })
  }
};
