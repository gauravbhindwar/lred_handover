'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async(t)=>{
      await queryInterface.createTable('transport_vehicle', {
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
        vehicleNo: {
          type: Sequelize.STRING,
          allowNull:false,
        },
        year:{
          type: Sequelize.INTEGER,
          allowNull:false,
        },
        typeId:{
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        modelId:{
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        capacity:{
          type: Sequelize.STRING,
          allowNull: false,
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

      await queryInterface.addConstraint('transport_vehicle', {
        type: 'foreign key',
        name: 'transport_vehicle_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });
      
      await queryInterface.addConstraint('transport_vehicle', {
        type: 'foreign key',
        name: 'transport_vehicle_type_fk',
        fields: ['typeId'],
        references: {
          table: 'transport_type',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('transport_vehicle', {
        type: 'foreign key',
        name: 'transport_vehicle_model_fk',
        fields: ['modelId'],
        references: {
          table: 'transport_model',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('transport_vehicle',{
        type:'foreign key',
        name: 'transport_vehicle_createdBy_fk',
        fields:['createdBy'],
        references:{
          table:'users',
          field: 'id',
        },
        transaction:t,
      })

      await queryInterface.addConstraint('transport_vehicle', {
        type: 'foreign key',
        name: 'transport_vehicle_updated_by_fk',
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
      await queryInterface.dropTable('transport_vehicle',{transaction:t});
    })
  }
};