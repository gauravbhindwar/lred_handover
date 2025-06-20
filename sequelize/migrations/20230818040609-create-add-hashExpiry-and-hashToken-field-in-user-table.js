'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t)=>{
      return Promise.all([
        queryInterface.addColumn('users','hashToken', 
        {
          type: Sequelize.STRING,
        },{ transaction: t }),
        queryInterface.addColumn('users','hashTokenExpiry', 
        {
          type: Sequelize.DATE,
        },{ transaction: t }),
      ])
    })   
  },
  async down(queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('users', 'hashToken', { transaction: t }),
        queryInterface.removeColumn('users', 'hashTokenExpiry', { transaction: t }),
      ])
    })
  }
};