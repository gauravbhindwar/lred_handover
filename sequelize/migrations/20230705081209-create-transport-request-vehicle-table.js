'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async(t)=>{
      await queryInterface.createTable('transport_request_vehicle', {
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
        requestId:{
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        vehicleId: {
          type: Sequelize.INTEGER,
          allowNull:false
        },
        driverId: {
          type: Sequelize.INTEGER,
          allowNull:false
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

      await queryInterface.addConstraint('transport_request_vehicle', {
        type: 'foreign key',
        name: 'transport_request_vehicle_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('transport_request_vehicle', {
        type: 'foreign key',
        name: 'transport_request_vehicle_request_id_fk',
        fields: ['requestId'],
        references: {
          table: 'transport_request',
          field: 'id',
        },
        transaction: t,
      });
      
      await queryInterface.addConstraint('transport_request_vehicle', {
        type: 'foreign key',
        name: 'transport_request_vehicle_driver_id_fk',
        fields: ['driverId'],
        references: {
          table: 'transport_driver',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('transport_request_vehicle', {
        type: 'foreign key',
        name: 'transport_request_vehicle_vehicle_id_fk',
        fields: ['vehicleId'],
        references: {
          table: 'transport_vehicle',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('transport_request_vehicle',{
        type:'foreign key',
        name: 'transport_request_vehicle_createdBy_fk',
        fields:['createdBy'],
        references:{
          table:'users',
          field: 'id',
        },
        transaction:t,
      })

      await queryInterface.addConstraint('transport_request_vehicle', {
        type: 'foreign key',
        name: 'transport_request_vehicle_updated_by_fk',
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
      await queryInterface.dropTable('transport_request_vehicle',{transaction:t});
    })
  }
};