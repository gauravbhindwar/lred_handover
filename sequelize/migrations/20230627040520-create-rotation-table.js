'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async(t)=>{
      await queryInterface.createTable('rotation', {
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
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        weekOn:{
          type: Sequelize.INTEGER,
        },
        weekOff:{
          type: Sequelize.INTEGER,
        },
        description:{
          type: Sequelize.STRING,
        },
        isResident:{
          type: Sequelize.BOOLEAN,
          defaultValue:false,
          allowNull:false
        },
        daysWorked:{
          type: Sequelize.STRING,
        },
        isAllDays:{
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        isWeekendBonus:{
          type: Sequelize.BOOLEAN,
          defaultValue:false,
          allowNull:false
        },
        isOvertimeBonus:{
          type: Sequelize.BOOLEAN,
          defaultValue:false,
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

      await queryInterface.addConstraint('rotation', {
        type: 'foreign key',
        name: 'rotation_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('rotation', {
        type: 'foreign key',
        name: 'rotation_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      
      await queryInterface.addConstraint('rotation', {
        type: 'foreign key',
        name: 'rotation_updated_by_fk',
        fields: ['updatedBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
    });
  },
  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async(t)=>{
      await queryInterface.dropTable('rotation',{transaction:t});
    })
  }
};