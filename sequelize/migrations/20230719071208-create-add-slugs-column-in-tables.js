'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t)=>{
      return Promise.all([
        queryInterface.addColumn('client','slug',
        {
          type: Sequelize.STRING,
        },
        {transaction: t}),

        queryInterface.addColumn('contact','slug',
        {
          type: Sequelize.STRING,
        },
        {transaction: t}),

        queryInterface.addColumn('segment','slug',
        {
          type: Sequelize.STRING,
        },
        {transaction: t}),

        queryInterface.addColumn('sub_segment','slug',
        {
          type: Sequelize.STRING,
        },
        {transaction: t}),

        queryInterface.addColumn('employee','slug',
        {
          type: Sequelize.STRING,
        },
        {transaction: t}),
      ])
    })
  },
  async down(queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('client', 'slug', { transaction: t }),
        queryInterface.removeColumn('contact', 'slug', { transaction: t }),
        queryInterface.removeColumn('segment', 'slug', { transaction: t }),
        queryInterface.removeColumn('sub_segment', 'slug', { transaction: t }),
        queryInterface.removeColumn('employee', 'slug', { transaction: t }),
      ])
    })
  }
};