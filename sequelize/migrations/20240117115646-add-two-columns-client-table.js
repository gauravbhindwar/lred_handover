'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('client', 'weekendDays',
          {
            type: Sequelize.STRING,
            allowNull: true,
          }, { transaction: t }),

          queryInterface.addColumn('client', 'isAllDays',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
          }, { transaction: t }),

        
      ])
    }
    )
  },

  async down(queryInterface, _Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('client', 'weekendDays', { transaction: t }),
        queryInterface.removeColumn('client', 'isAllDays', { transaction: t }),
      ])
    })
  }
};