'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface,Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('medical_request', 'medicalExpiry',
        {
          type: Sequelize.DATE,
        }, { transaction: t }),
      ])
    })
  },
  
  async down (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('medical_request', 'medicalExpiry', { transaction: t }),
      ])
    })
  }
};
