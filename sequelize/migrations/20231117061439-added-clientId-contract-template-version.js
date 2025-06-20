'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('contract_template_version', 'clientId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
          }, { transaction: t }),

          queryInterface.addConstraint('contract_template_version',{
            type: 'foreign key',
            name: 'contract_template_version_client_id_fk',
            fields: ['clientId'],
            references:{
              table:'client',
              field: 'id'
            },
            transaction: t,
          }),
      ])
    }
    )
  },

  async down(queryInterface, _Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('contract_template_version', 'clientId', { transaction: t }),
        queryInterface.removeConstraint('contract_template_version', 'clientId')
      ])
    })
  }
};