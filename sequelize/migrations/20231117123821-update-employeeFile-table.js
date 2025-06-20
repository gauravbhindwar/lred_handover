'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn('employee_file', 'folderId', {
          type: Sequelize.INTEGER,
          allowNull: true,
        }, { transaction: t }),
        queryInterface.changeColumn('employee_file', 'createdBy', {
          type: Sequelize.INTEGER,
          allowNull: true,
        }, { transaction: t }),
      
      ])
      
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn('employee_file', 'folderId', {
          type: Sequelize.INTEGER,
          allowNull: false,
        }, { transaction: t }),
        queryInterface.changeColumn('employee_file', 'createdBy', {
          type: Sequelize.INTEGER,
          allowNull: false,
        }, { transaction: t }),
      ])
    })
  }
};
