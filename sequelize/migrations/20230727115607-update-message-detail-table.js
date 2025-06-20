'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('message_detail', 'managerUserId',
          {
            type: Sequelize.INTEGER,
            allowNull:true
          }, { transaction: t }),

          queryInterface.addConstraint('message_detail', {
            type: 'foreign key',
            name: 'messageDetail_manager_user_id_fk',
            fields: ['managerUserId'],
            references: {
              table: 'users',
              field: 'id',
            },
            transaction: t,
          })
      ])
      
    }
    )
  },

  async down(queryInterface, _Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('message_detail', 'managerUserId', { transaction: t }),
        queryInterface.removeConstraint('message_detail', {
          type: 'foreign key',
          name: 'messageDetail_manager_user_id_fk',
          fields: ['managerUserId'],
          references: {
            table: 'users',
            field: 'id',
          },
          transaction: t,
        })
      ])
    })
  }
};