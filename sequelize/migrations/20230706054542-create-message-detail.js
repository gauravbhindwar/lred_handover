'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'message_detail',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          messageId: { type: Sequelize.INTEGER, allowNull: false },
          employeeId: { type: Sequelize.INTEGER, allowNull: true },
          segmentId: { type: Sequelize.INTEGER, allowNull: true },
        },
        { transaction: t },
      );
      await queryInterface.addConstraint('message_detail', {
        type: 'foreign key',
        name: 'messageDetail_message_id_fk',
        fields: ['messageId'],
        references: {
          table: 'message',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('message_detail', {
        type: 'foreign key',
        name: 'messageDetail_employee_id_fk',
        fields: ['employeeId'],
        references: {
          table: 'employee',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('message_detail', {
        type: 'foreign key',
        name: 'messageDetail_segment_id_fk',
        fields: ['segmentId'],
        references: {
          table: 'segment',
          field: 'id',
        },
        transaction: t,
      });
    });
  },

  async down (queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('message_detail', { transaction: t });
    });
  }
};
