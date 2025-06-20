'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'queue',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
          },
          processName: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          employeeId: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          clientId: {
            type: Sequelize.INTEGER,
          },
          clientEndDate:{
            type: Sequelize.DATE,
            allowNull: false,
          },
          startDate:{
            type: Sequelize.DATE,
            allowNull: true,
          },
          endDate:{
            type: Sequelize.DATE,
            allowNull: true,
          },
          status:{
            type: Sequelize.ENUM('PENDING','INPROGRESS', 'COMPLETED','RETAKE','FAILED'), 
            allowNull: false, 
            defaultValue: 'PENDING'
          },
          error:{
            type: Sequelize.TEXT,
            allowNull: true,
          },
          totalTakes:{
            type: Sequelize.INTEGER,
            defaultValue: 0,
          },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
      await queryInterface.addConstraint('queue', {
        type: 'foreign key',
        name: 'queue_employee_id_fk',
        fields: ['employeeId'],
        references: {
          table: 'employee',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('queue', {
        type: 'foreign key',
        name: 'queue_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('queue', {
        type: 'foreign key',
        name: 'queue_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('queue', {
        type: 'foreign key',
        name: 'queue_updated_by_fk',
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
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('queue', { transaction: t });
    });
  }
};
