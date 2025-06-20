'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async(t)=>{
      await queryInterface.createTable('requests', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        clientId:{
          type: Sequelize.INTEGER,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        contractNumber: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        contractId: {
          type: Sequelize.INTEGER,
        },
        employeeId: {
          type: Sequelize.INTEGER,
        },
        mobileNumber: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
        },
        emailDocuments: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        collectionDelivery: {
          type: Sequelize.ENUM('COLLECTION','DELIVERY'),
          allowNull: false,
          defaultValue: 'COLLECTION',
        },
        deliveryDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },      
        documentTotal: {
          type: Sequelize.INTEGER,
        },      
        status:{
          type: Sequelize.ENUM('NEW','STARTED','DECLINED','COMPLETED'),
          allowNull: false,
          defaultValue: 'NEW'
        },
        reviewedDate:{
          type: Sequelize.DATE,
        },
        reviewedBy:{
          type: Sequelize.INTEGER,
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

      await queryInterface.addConstraint('requests', {
        type: 'foreign key',
        name: 'requests_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('requests', {
        type: 'foreign key',
        name: 'requests_employee_id_fk',
        fields: ['employeeId'],
        references: {
          table: 'employee',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('requests', {
        type: 'foreign key',
        name: 'requests_contract_id_fk',
        fields: ['contractId'],
        references: {
          table: 'employee_contract',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('requests',{
        type:'foreign key',
        name: 'requests_createdBy_fk',
        fields:['createdBy'],
        references:{
          table:'users',
          field: 'id',
        },
        transaction:t,
      })

      await queryInterface.addConstraint('requests', {
        type: 'foreign key',
        name: 'requests_updated_by_fk',
        fields: ['updatedBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
    })
  },
  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async(t)=>{
      await queryInterface.dropTable('requests',{transaction:t});
    })
  }
};