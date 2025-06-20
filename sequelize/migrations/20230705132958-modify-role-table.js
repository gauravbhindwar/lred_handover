'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('role', 'createdBy', { type: Sequelize.INTEGER }, { transaction: t }),
        queryInterface.addColumn('role', 'updatedBy', { type: Sequelize.INTEGER }, { transaction: t }),
        queryInterface.addConstraint('role', {
          type: 'foreign key',
          name: 'role_created_by_fk',
          fields: ['createdBy'],
          references: {
            table: 'role',
            field: 'id',
          },
          transaction: t,
        }),
        queryInterface.addConstraint('role', {
          type: 'foreign key',
          name: 'role_updated_by_fk',
          fields: ['updatedBy'],
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

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeConstraint('role','role_created_by_fk', { transaction:t }),
        queryInterface.removeConstraint('role','role_updated_by_fk', { transaction:t }),

        queryInterface.removeColumn('role', 'createdBy', { transaction: t }),
        queryInterface.removeColumn('role', 'updatedBy', { transaction: t }),
      ])
    })
  }
};
