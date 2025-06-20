'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.createTable('contact', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull:false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull:false,
      },
      address1: {
        type: Sequelize.STRING,
        allowNull:false,
      },
      address2: {
        type: Sequelize.STRING,
      },
      address3: {
        type: Sequelize.STRING,
      },
      address4: {
        type: Sequelize.STRING,
      },
      city: {
        type: Sequelize.STRING,
        allowNull:false,
      },
      region: {
        type: Sequelize.STRING,
        allowNull:false,
      },
      postalCode: {
        type: Sequelize.STRING,
        allowNull:false,
      },
      country: {
        type: Sequelize.STRING,
        allowNull:false,
      },
      dueDateDays: {
        type: Sequelize.INTEGER,
      },
      brandingTheme: {
        type: Sequelize.STRING,
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
    },{ transaction: t });
  })
  },
  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
    await queryInterface.dropTable('contact',{ transaction: t },);
  })
  }
};