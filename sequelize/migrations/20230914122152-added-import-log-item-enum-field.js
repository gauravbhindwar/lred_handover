'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t)=>{
      return Promise.all([
        queryInterface.removeColumn('import_log_items','status',{transaction: t}),
        queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_import_log_items_status"',{transaction: t}),
        queryInterface.addColumn('import_log_items','status',
        {
          type: Sequelize.ENUM('OK','INFO','ERROR'), 
          defaultValue: 'OK', 
          allowNull: false,
        },{transaction: t})
      ])
    })
      
  },
  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('import_log_items','status',{transaction: t}),
        queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_import_log_items_status"',{transaction: t}),
        queryInterface.addColumn('import_log_items','status',
        {
          type: Sequelize.ENUM('OK','INFO'), 
          defaultValue: 'OK', 
          allowNull: false,
        },{transaction: t})
      ])
    })
  }
};