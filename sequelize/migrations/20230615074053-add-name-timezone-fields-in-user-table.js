'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('users', 'name',
          {
            type: Sequelize.STRING
          }, 
          { transaction: t }),
        queryInterface.addColumn('users', 'timezone',
          {
            type: Sequelize.STRING
          }, 
          { transaction: t }),
        queryInterface.addColumn('users', 'isMailNotification',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false
          }, 
          { transaction: t }),
        queryInterface.removeColumn('users', 'firstName', { transaction: t }),
        queryInterface.removeColumn('users', 'lastName', { transaction: t }),
      ])
    }
    )
  },

  async down (queryInterface, Sequelize) {  
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('users', 'name', { transaction: t }),
        queryInterface.removeColumn('users', 'timezone', { transaction: t }),
        queryInterface.removeColumn('users', 'isMailNotification', { transaction: t }),
        queryInterface.addColumn('users', 'firstName',
          {
            type: Sequelize.STRING
          }, 
          { transaction: t }),
        queryInterface.addColumn('users', 'lastName',
          {
            type: Sequelize.STRING
          }, 
          { transaction: t }),
      ])
    })
  }
};
