'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('users', 'roleId',
          {
            type: Sequelize.INTEGER, allowNull: false
          }, 
          { transaction: t }),
        queryInterface.addConstraint('users', {
          type: 'foreign key',
          name: 'users_role_by_fk',
          fields: ['roleId'],
          references: {
            table: 'role',
            field: 'id',
          },
          transaction: t,
        }),
      ])
    }
    )
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('users', 'roleId', { transaction: t }),
        queryInterface.removeConstraint('users', 'roleId')
      ])
    })
  }
};
