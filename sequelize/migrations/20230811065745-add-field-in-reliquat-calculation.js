'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('reliquat_calculation', 'deletedAt',
          {
            type: Sequelize.DATE,
            allowNull:true
          }, { transaction: t }),
      ]) 
    }
    )
  },

  async down(queryInterface, _Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('reliquat_calculation', 'deletedAt', { transaction: t }),
      ])
    })
  }
};


