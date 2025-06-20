'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async(t)=>{
      await queryInterface.createTable('transport_vehicle_documents', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        clientId:{
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        vehicleId: {
          type: Sequelize.INTEGER,
          allowNull:false,
        },
        folderId: {
          type: Sequelize.INTEGER,
          allowNull:false,
        },
        documentName: {
          type: Sequelize.STRING,
          allowNull:false,
        },
        documentPath: {
          type: Sequelize.STRING,
          allowNull:false,
        },
        documentSize:{
          type: Sequelize.INTEGER,
          allowNull:false,
        },
        issueDate: {
          type: Sequelize.DATE,
        },
        expiryDate: {
          type: Sequelize.DATE,
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

      await queryInterface.addConstraint('transport_vehicle_documents', {
        type: 'foreign key',
        name: 'transport_vehicle_documents_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });
      
      await queryInterface.addConstraint('transport_vehicle_documents', {
        type: 'foreign key',
        name: 'transport_vehicle_documents_vehicle_id_fk',
        fields: ['vehicleId'],
        references: {
          table: 'transport_vehicle',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('transport_vehicle_documents', {
        type: 'foreign key',
        name: 'transport_vehicle_documents_folder_id_fk',
        fields: ['folderId'],
        references: {
          table: 'folder',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('transport_vehicle_documents',{
        type:'foreign key',
        name: 'transport_vehicle_documents_createdBy_fk',
        fields:['createdBy'],
        references:{
          table:'users',
          field: 'id',
        },
        transaction:t,
      })

      await queryInterface.addConstraint('transport_vehicle_documents', {
        type: 'foreign key',
        name: 'transport_vehicle_documents_updated_by_fk',
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
      await queryInterface.dropTable('transport_vehicle_documents',{transaction:t});
    })
  }
};