'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t)=>{
      return Promise.all([
        queryInterface.removeColumn('transport_request','status',{transaction: t}),
        queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_transport_request_status"',{transaction: t}),
        queryInterface.addColumn('transport_request','status',
        {
          type: Sequelize.ENUM('DRAFT', 'INPROGRESS', 'STARTED','COMPLETED'), 
          defaultValue: 'DRAFT', 
          allowNull: true,
        },{transaction: t})
      ])
    })
      
  },
  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('transport_request','status',{transaction: t}),
        queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_transport_request_status"',{transaction: t}),
        queryInterface.addColumn('transport_request','status',
        {
          type: Sequelize.ENUM('DRAFT','NEW'), 
          defaultValue: 'DRAFT', 
          allowNull: true,
        },{transaction: t})
      ])
    })
  }
};