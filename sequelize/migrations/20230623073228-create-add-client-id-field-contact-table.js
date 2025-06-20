'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t)=>{
      return Promise.all([
        queryInterface.addColumn('contact','clientId',
        {
          type: Sequelize.INTEGER,
          allowNull:false,
          references:{
            model: 'client',
            key: 'id'
          } 
        },
        {transaction:t}
        ),
      ])
    })
  },
  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (t)=>{
      return Promise.all([
        await queryInterface.removeColumn('contact','clientId',{transaction:t})
      ])
    })
  }
};
