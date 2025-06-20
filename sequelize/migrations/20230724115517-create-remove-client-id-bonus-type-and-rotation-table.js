'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('bonus_type', 'clientId', { transaction: t }),
        queryInterface.removeColumn('rotation', 'clientId', { transaction: t }),
      ])
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('bonus_type', 'clientId',
          {
            type: Sequelize.INTEGER
          }, 
          { transaction: t }),

        queryInterface.addColumn('rotation', 'clientId',
          {
            type: Sequelize.INTEGER, allowNull: false
          }, 
          { transaction: t }),

        queryInterface.addConstraint('bonus_type', {
          type: 'foreign key',
          name: 'bonus_type_client_id_fk',
          fields: ['clientId'],
          references: {
            table: 'client',
            field: 'id',
          },
          transaction: t,
        }),
      
        queryInterface.addConstraint('rotation', {
          type: 'foreign key',
          name: 'rotation_client_id_fk',
          fields: ['clientId'],
          references: {
            table: 'client',
            field: 'id',
          },
          transaction: t,
        })
      ])
    }
    )
  },
};