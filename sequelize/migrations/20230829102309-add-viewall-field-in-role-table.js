'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('role', 'isViewAll',
          {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false
          }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('role', 'isViewAll', { transaction: t }),
      ])
    })
  }
};
