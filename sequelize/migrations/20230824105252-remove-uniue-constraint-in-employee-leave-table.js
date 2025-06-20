'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn('employee_leave', 'reference', {
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        }, { transaction: t }),
        queryInterface.removeIndex('employee_leave', 'unique_employee_leave_reference_uk', { transaction: t}),
        queryInterface.removeConstraint('employee_leave', 'employee_leave_reference_key', { transaction: t})
      ])
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn('employee_leave', 'reference', {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        }, { transaction: t }),
        queryInterface.addIndex('employee_leave', {
          name: 'unique_employee_leave_reference_uk',
          fields: ['reference'],
          unique: true,
          where: {
            deletedAt: null,
          },
          transaction: t,
        }),
      ])
    })
  }
};
