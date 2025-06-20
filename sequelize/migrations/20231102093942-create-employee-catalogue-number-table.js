'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'employee_catalogue_number',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          employeeId: {type: Sequelize.INTEGER ,allowNull:true},
          startDate:{
            type: Sequelize.DATE,
            allowNull: true,
          },
          catalogueNumber: {type: Sequelize.STRING,allowNull: true},
        },
        { transaction: t },
      );
      await queryInterface.addConstraint('employee_catalogue_number', {
        type: 'foreign key',
        name: 'employee_catalogue_number_employee_id_fk',
        fields: ['employeeId'],
        references: {
          table: 'employee',
          field: 'id',
        },
        transaction: t,
      });
      
    });
  },

  async down (queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('employee_catalogue_number', { transaction: t });
    });
  }
};
