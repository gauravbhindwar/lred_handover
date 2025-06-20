'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn('employee_rotation', 'rotationId', {
          type: Sequelize.INTEGER,
          allowNull: true,
        }, { transaction: t }),
      ])
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn('employee_rotation', 'rotationId', {
          type: Sequelize.STRING,
          allowNull: true,
        }, { transaction: t }),
      ])
    })
  }
};
