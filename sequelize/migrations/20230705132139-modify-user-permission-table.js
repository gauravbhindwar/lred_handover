'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeConstraint('user_permission','user_permission_user_id_fk', { transaction:t }),
        queryInterface.removeColumn('user_permission', 'userId', { transaction: t }),

        queryInterface.addColumn('user_permission', 'loginUserId', { type: Sequelize.INTEGER, allowNull: false }, { transaction: t }),
        queryInterface.addColumn('user_permission', 'roleId', { type: Sequelize.INTEGER }, { transaction: t }),
        queryInterface.addColumn('user_permission', 'clientId', { type: Sequelize.INTEGER }, { transaction: t }),
        
        queryInterface.addConstraint('user_permission', {
          type: 'foreign key',
          name: 'user_permission_login_user_id_fk',
          fields: ['loginUserId'],
          references: {
            table: 'login_user',
            field: 'id',
          },
          transaction: t,
        }),
        queryInterface.addConstraint('user_permission', {
          type: 'foreign key',
          name: 'user_permission_role_id_fk',
          fields: ['roleId'],
          references: {
            table: 'role',
            field: 'id',
          },
          transaction: t,
        }),
        queryInterface.addConstraint('user_permission', {
          type: 'foreign key',
          name: 'user_permission_client_id_fk',
          fields: ['clientId'],
          references: {
            table: 'client',
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
        queryInterface.removeConstraint('user_permission','user_permission_role_id_fk', { transaction:t }),
        queryInterface.removeConstraint('user_permission','user_permission_login_user_id_fk', { transaction:t }),
        queryInterface.removeConstraint('user_permission','user_permission_client_id_fk', { transaction:t }),
        
        queryInterface.addColumn('user_permission', 'userId', { type: Sequelize.INTEGER, allowNull: false }, { transaction: t }),
        queryInterface.addConstraint('user_permission', {
          type: 'foreign key',
          name: 'user_permission_user_id_fk',
          fields: ['userId'],
          references: {
            table: 'users',
            field: 'id',
          },
          transaction: t,
        }),

        queryInterface.removeColumn('user_permission', 'loginUserId', { transaction: t }),
        queryInterface.removeColumn('user_permission', 'roleId', { transaction: t }),
        queryInterface.removeColumn('user_permission', 'clientId', { transaction: t }),
      ])
    })
  }
};
