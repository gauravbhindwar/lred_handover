'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t)=>{
      return Promise.all([
        queryInterface.addColumn('transport_driver','unavailableDates', 
        {
          type: Sequelize.STRING,
        },{ transaction: t })
      ])
    })
      
  },
  async down(queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('transport_driver', 'unavailableDates', { transaction: t }),
      ])
    })
  }
};