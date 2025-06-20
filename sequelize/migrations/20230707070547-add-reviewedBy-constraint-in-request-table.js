'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addConstraint('requests', {
          type: 'foreign key',
          name: 'requests_reviewed_by_fk',
          fields: ['reviewedBy'],
          references: {
            table: 'users',
            field: 'id',
          },
          transaction: t,
        }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeConstraint('requests', 'requests_reviewed_by_fk', { transaction: t }),
      ])
    })
  }
};
