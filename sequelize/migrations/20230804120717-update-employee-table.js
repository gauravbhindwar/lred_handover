'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('employee', 'overtime01Bonus',
          {
            type: Sequelize.FLOAT,
            allowNull:true
          }, { transaction: t }),

          queryInterface.addColumn('employee', 'overtime02Bonus',
          {
            type: Sequelize.FLOAT,
            allowNull:true
          }, { transaction: t }),

          queryInterface.addColumn('employee', 'weekendOvertimeBonus',
          {
            type: Sequelize.FLOAT,
            allowNull:true
          }, { transaction: t }),

          queryInterface.addColumn('employee', 'customBonus',
          {
            type: Sequelize.STRING,
            allowNull:true
          }, { transaction: t }),
      ])
    }
    )
  },

  async down(queryInterface, _Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('employee', 'overtime01Bonus', { transaction: t }),
        queryInterface.removeColumn('employee', 'overtime02Bonus', { transaction: t }),
        queryInterface.removeColumn('employee', 'weekendOvertimeBonus', { transaction: t }),
        queryInterface.removeColumn('employee', 'customBonus', { transaction: t }),
      ])
    })
  }
};


