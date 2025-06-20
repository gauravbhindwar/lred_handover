'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('folder', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull:false
      },
      index:{
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      typeId:{
        type: Sequelize.INTEGER,
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
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('folder');
  }
};