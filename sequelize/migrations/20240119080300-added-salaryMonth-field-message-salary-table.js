'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('message_salary', 'salaryMonth',
          {
            type: Sequelize.STRING,
            allowNull: true,
          }, { transaction: t }),

      ])
    }
    )
  },

  async down(queryInterface, _Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('message_salary', 'salaryMonth', { transaction: t }),
      ])
    })
  }
};