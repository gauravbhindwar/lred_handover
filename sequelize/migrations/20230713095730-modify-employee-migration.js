'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('employee', 'firstName', { transaction: t }),
        queryInterface.removeColumn('employee', 'lastName', { transaction: t }),
        queryInterface.removeColumn('employee', 'dOB', { transaction: t }),
        queryInterface.removeColumn('employee', 'placeOfBirth', { transaction: t }),
        queryInterface.removeColumn('employee', 'gender', { transaction: t }),
        queryInterface.removeColumn('employee', 'mobileNumber', { transaction: t }),
        queryInterface.removeColumn('employee', 'email', { transaction: t }),
        queryInterface.removeColumn('employee', 'profilePicture', { transaction: t }),

        queryInterface.addColumn('employee', 'loginUserId', { type: Sequelize.INTEGER, allowNull: false }, { transaction: t }),

        queryInterface.addConstraint('employee', {
          type: 'foreign key',
          name: 'employee_login_user_id_fk',
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
        queryInterface.removeConstraint('employee','employee_login_user_id_fk', { transaction:t }),

        queryInterface.removeColumn('employee', 'loginUserId', { transaction: t }),

        queryInterface.addColumn('employee', 'firstName', { type: Sequelize.STRING, allowNull: false }, { transaction: t }),
        queryInterface.addColumn('employee', 'lastName', { type: Sequelize.STRING, allowNull: false }, { transaction: t }),
        queryInterface.addColumn('employee', 'dOB', { type: Sequelize.DATE, allowNull: true }, { transaction: t }),
        queryInterface.addColumn('employee', 'placeOfBirth', { type: Sequelize.STRING, allowNull: true }, { transaction: t }),
        queryInterface.addColumn('employee', 'gender', { type: Sequelize.STRING, allowNull: false }, { transaction: t }),
        queryInterface.addColumn('employee', 'mobileNumber', { type: Sequelize.STRING, allowNull: true }, { transaction: t }),
        queryInterface.addColumn('employee', 'email', { type: Sequelize.STRING, allowNull: true }, { transaction: t }),
        queryInterface.addColumn('employee', 'profilePicture', { type: Sequelize.TEXT }, { transaction: t }),

      ])
    })
  }
};
