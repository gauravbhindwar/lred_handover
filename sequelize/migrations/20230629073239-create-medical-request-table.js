'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async(t)=>{
      await queryInterface.createTable('medical_request', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        employeeId:{
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        reference: {
          type: Sequelize.STRING,
          unique: true,
          allowNull: false,
        },
        medicalTypeId:{
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        medicalDate: { 
          type: Sequelize.DATE, 
          allowNull: false, 
        },
        status: { 
          type: Sequelize.ENUM('ACTIVE', 'CANCELLED'), 
          allowNull: false, 
          defaultValue: 'ACTIVE' 
        },
        createdAt: { 
          type: Sequelize.DATE, 
          allowNull: false, 
          defaultValue: Sequelize.NOW 
        },
        createdBy: { 
          type: Sequelize.INTEGER 
        },
        updatedAt: { 
          type: Sequelize.DATE, 
          allowNull: false 
        },
        updatedBy: { 
          type: Sequelize.INTEGER 
        },
        deletedAt: { 
          type: Sequelize.DATE 
        },
      },{transaction:t});

      await queryInterface.addConstraint('medical_request', {
        type: 'foreign key',
        name: 'medical_request_employee_id_fk',
        fields: ['employeeId'],
        references: {
          table: 'employee',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('medical_request', {
        type: 'foreign key',
        name: 'medical_request_medical_type_id_fk',
        fields: ['medicalTypeId'],
        references: {
          table: 'medical_type',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('medical_request', {
        type: 'foreign key',
        name: 'medical_request_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      
      await queryInterface.addConstraint('medical_request', {
        type: 'foreign key',
        name: 'medical_request_updated_by_fk',
        fields: ['updatedBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
    });
  },

  async down (queryInterface) {
    await queryInterface.sequelize.transaction(async(t)=>{
      await queryInterface.dropTable('medical_request',{transaction:t});
    })
  }
};
