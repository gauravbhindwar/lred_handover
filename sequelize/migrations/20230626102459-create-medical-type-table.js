'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async(t)=>{
      await queryInterface.createTable('medical_type', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        index:{
          type:Sequelize.INTEGER,
          allowNull:false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull:false,
        },
        format: {
          type: Sequelize.STRING,
          allowNull:false,
        },
        daysBeforeExpiry: {
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
    })
  },
  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async(t)=>{
      await queryInterface.dropTable('medical_type',{transaction:t});
    })
  }
};