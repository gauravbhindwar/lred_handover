'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('client', 'name', { transaction: t }),

        queryInterface.addColumn('client', 'loginUserId', { type: Sequelize.INTEGER, allowNull: false }, { transaction: t }),

        queryInterface.addConstraint('client', {
          type: 'foreign key',
          name: 'client_login_user_id_fk',
          fields: ['loginUserId'],
          references: {
            table: 'login_user',
            field: 'id',
          },
          transaction: t,
        }),
      ])
      }
    )
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeConstraint('client','client_login_user_id_fk', { transaction:t }),

        queryInterface.removeColumn('client', 'loginUserId', { transaction: t }),

        queryInterface.addColumn('client', 'name', { type: Sequelize.STRING, allowNull: false }, { transaction: t }),
      ])
    })
  }
};
