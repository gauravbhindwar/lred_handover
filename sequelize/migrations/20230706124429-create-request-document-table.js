'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async(t)=>{
      await queryInterface.createTable('request_document', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        requestId:{
          type: Sequelize.INTEGER,
        },
        documentType: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        otherInfo: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        completedBy: {
          type: Sequelize.INTEGER,
        }, 
        completedDate: {
          type: Sequelize.DATE,
        },
        createdAt: { 
          type: Sequelize.DATE, 
          allowNull: false, 
          defaultValue: Sequelize.NOW 
        },
        updatedAt: { 
          type: Sequelize.DATE, 
          allowNull: false 
        },
        deletedAt: { 
          type: Sequelize.DATE 
        },
      },{transaction:t});

      await queryInterface.addConstraint('request_document', {
        type: 'foreign key',
        name: 'request_document_request_id_fk',
        fields: ['requestId'],
        references: {
          table: 'requests',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('request_document', {
        type: 'foreign key',
        name: 'request_document_request_type_id_fk',
        fields: ['documentType'],
        references: {
          table: 'request_type',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('request_document', {
        type: 'foreign key',
        name: 'request_document_user_id_fk',
        fields: ['completedBy'],
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
      await queryInterface.dropTable('request_document',{transaction:t});
    })
  }
};