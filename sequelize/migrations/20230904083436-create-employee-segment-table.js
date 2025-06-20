'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'employee_segment',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          employeeId: { type: Sequelize.INTEGER, allowNull: true },
          segmentId: { type: Sequelize.INTEGER, allowNull: true },
          subSegmentId: { type: Sequelize.INTEGER, allowNull: true },
          date: { type: Sequelize.DATE, allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
      await queryInterface.addConstraint('employee_segment', {
        type: 'foreign key',
        name: 'employee_segment_employee_id_fk',
        fields: ['employeeId'],
        references: {
          table: 'employee',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee_segment', {
        type: 'foreign key',
        name: 'employee_segment_segment_id_fk',
        fields: ['segmentId'],
        references: {
          table: 'segment',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee_segment', {
        type: 'foreign key',
        name: 'employee_segment_subsegment_id_fk',
        fields: ['subSegmentId'],
        references: {
          table: 'sub_segment',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee_segment', {
        type: 'foreign key',
        name: 'employee_segment_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee_segment', {
        type: 'foreign key',
        name: 'employee_segment_updated_by_fk',
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
      await queryInterface.dropTable('employee_segment', { transaction: t });
    });
  }
};
