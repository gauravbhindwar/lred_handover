'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    return queryInterface.sequelize.transaction(() => {
      return Promise.all([
        queryInterface.addConstraint('employee_contract', {
          fields: ['id'],
          type: 'primary key',
          name: 'id'
        })
      ])
    })
  },

  async down(queryInterface, _Sequelize) {
    return queryInterface.sequelize.transaction(() => {
      return Promise.all([
        queryInterface.removeConstraint('employee_contract', 'id')
       
      ])
    })
  }
};
