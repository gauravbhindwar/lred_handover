'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeIndex('users','unique_email_uk', { transaction:t }),
        queryInterface.removeConstraint('users','users_role_by_fk', { transaction:t }),

        queryInterface.removeColumn('users', 'email', { transaction: t }),
        queryInterface.removeColumn('users', 'name', { transaction: t }),
        queryInterface.removeColumn('users', 'username', { transaction: t }),
        queryInterface.removeColumn('users', 'password', { transaction: t }),
        queryInterface.removeColumn('users', 'randomPassword', { transaction: t }),
        queryInterface.removeColumn('users', 'addedBy', { transaction: t }),
        queryInterface.removeColumn('users', 'birthDate', { transaction: t }),
        queryInterface.removeColumn('users', 'gender', { transaction: t }),
        queryInterface.removeColumn('users', 'code', { transaction: t }),
        queryInterface.removeColumn('users', 'phone', { transaction: t }),
        queryInterface.removeColumn('users', 'profileImage', { transaction: t }),
        queryInterface.removeColumn('users', 'verified', { transaction: t }),
        queryInterface.removeColumn('users', 'timezone', { transaction: t }),
        queryInterface.removeColumn('users', 'isMailNotification', { transaction: t }),
        queryInterface.removeColumn('users', 'roleId', { transaction: t }),

        queryInterface.addColumn('users', 'loginUserId', { type: Sequelize.INTEGER, allowNull: false }, { transaction: t }),
        queryInterface.addColumn('users', 'roleId', { type: Sequelize.INTEGER, allowNull: false }, { transaction: t }),
        queryInterface.addColumn('users', 'createdBy', { type: Sequelize.INTEGER }, { transaction: t }),
        queryInterface.addColumn('users', 'updatedBy', { type: Sequelize.INTEGER }, { transaction: t }),

        queryInterface.addConstraint('users', {
          type: 'foreign key',
          name: 'users_login_user_id_fk',
          fields: ['loginUserId'],
          references: {
            table: 'login_user',
            field: 'id',
          },
          transaction: t,
        }),
        queryInterface.addConstraint('users', {
          type: 'foreign key',
          name: 'users_role_id_fk',
          fields: ['roleId'],
          references: {
            table: 'role',
            field: 'id',
          },
          transaction: t,
        }),
        queryInterface.addConstraint('users', {
          type: 'foreign key',
          name: 'users_created_by_fk',
          fields: ['createdBy'],
          references: {
            table: 'users',
            field: 'id',
          },
          transaction: t,
        }),
        queryInterface.addConstraint('users', {
          type: 'foreign key',
          name: 'users_updated_by_fk',
          fields: ['updatedBy'],
          references: {
            table: 'users',
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
        queryInterface.removeConstraint('users','users_login_user_id_fk', { transaction:t }),
        queryInterface.removeConstraint('users','users_role_id_fk', { transaction:t }),
        queryInterface.removeConstraint('users','users_created_by_fk', { transaction:t }),
        queryInterface.removeConstraint('users','users_updated_by_fk', { transaction:t }),

        queryInterface.removeColumn('users', 'loginUserId', { transaction: t }),
        queryInterface.removeColumn('users', 'roleId', { transaction: t }),
        queryInterface.removeColumn('users', 'createdBy', { transaction: t }),
        queryInterface.removeColumn('users', 'updatedBy', { transaction: t }),

        queryInterface.addColumn('users', 'email', { type: Sequelize.STRING, allowNull: false }, { transaction: t }),
        queryInterface.addColumn('users', 'name', { type: Sequelize.STRING }, { transaction: t }),
        queryInterface.addColumn('users', 'username', { type: Sequelize.STRING }, { transaction: t }),
        queryInterface.addColumn('users', 'password', { type: Sequelize.TEXT }, { transaction: t }),
        queryInterface.addColumn('users', 'randomPassword', { type: Sequelize.TEXT }, { transaction: t }),
        queryInterface.addColumn('users', 'addedBy', { type: Sequelize.INTEGER }, { transaction: t }),
        queryInterface.addColumn('users', 'birthDate', { type: Sequelize.DATE }, { transaction: t }),
        queryInterface.addColumn('users', 'gender', { type: Sequelize.STRING }, { transaction: t }),
        queryInterface.addColumn('users', 'code', { type: Sequelize.STRING }, { transaction: t }),
        queryInterface.addColumn('users', 'phone', { type: Sequelize.STRING }, { transaction: t }),
        queryInterface.addColumn('users', 'profileImage', { type: Sequelize.STRING }, { transaction: t }),
        queryInterface.addColumn('users', 'verified', { type: Sequelize.BOOLEAN, allowNull: false }, { transaction: t }),
        queryInterface.addColumn('users', 'timezone', { type: Sequelize.STRING}, { transaction: t }),
        queryInterface.addColumn('users', 'isMailNotification', { type: Sequelize.BOOLEAN }, { transaction: t }),

        queryInterface.addIndex('users', {
          name: 'unique_email_uk',
          fields: ['email'],
          unique: true,
          where: {
            deletedAt: null,
          },
          transaction: t,
        }),
        queryInterface.addConstraint('users', {
          type: 'foreign key',
          name: 'users_added_by_fk',
          fields: ['addedBy'],
          references: {
            table: 'users',
            field: 'id',
          },
          transaction: t,
        }),
      ])
    })
  }
};
