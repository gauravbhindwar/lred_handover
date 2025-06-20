'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async(t)=>{
      await queryInterface.createTable('transport_driver', {
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
        driverNo: {
          type: Sequelize.STRING,
          allowNull:false,
        },
        firstName:{
          type: Sequelize.STRING,
          allowNull:false,
        },
        lastName:{
          type: Sequelize.STRING,
          allowNull:false,
        },
        positionId:{
          type: Sequelize.INTEGER,
          allowNull:false,
        },
        companyStart: { 
          type: Sequelize.DATE, 
          allowNull: false, 
        },
        experienceStart: { 
          type: Sequelize.DATE, 
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

      await queryInterface.addConstraint('transport_driver', {
        type: 'foreign key',
        name: 'transport_driver_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('transport_driver', {
        type: 'foreign key',
        name: 'transport_driver_position_id_fk',
        fields: ['positionId'],
        references: {
          table: 'transport_positions',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('transport_driver',{
        type:'foreign key',
        name: 'transport_driver_createdBy_fk',
        fields:['createdBy'],
        references:{
          table:'users',
          field: 'id',
        },
        transaction:t,
      })

      await queryInterface.addConstraint('transport_driver', {
        type: 'foreign key',
        name: 'transport_driver_updated_by_fk',
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
    await queryInterface.dropTable('transport_driver');
  }
};