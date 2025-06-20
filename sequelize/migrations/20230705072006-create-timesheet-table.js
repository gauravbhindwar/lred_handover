'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'timesheet',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          employeeId: { type: Sequelize.INTEGER, allowNull: true },
          clientId: { type: Sequelize.INTEGER, allowNull: false },
          status: { type: Sequelize.ENUM('APPROVED', 'UNAPPROVED'), allowNull: false, defaultValue: 'UNAPPROVED'},
          segmentId: { type: Sequelize.INTEGER, allowNull: true },
          subSegmentId: { type: Sequelize.INTEGER, allowNull: true },
          startDate: { type: Sequelize.DATE, allowNull: false },
          endDate: { type: Sequelize.DATE, allowNull: false },
          totalDays: { type: Sequelize.INTEGER },
          approvedAt: { type: Sequelize.DATE, allowNull: true },
          approvedBy: { type: Sequelize.INTEGER },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
      await queryInterface.addConstraint('timesheet', {
        type: 'foreign key',
        name: 'timesheet_employee_id_fk',
        fields: ['employeeId'],
        references: {
          table: 'employee',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('timesheet', {
        type: 'foreign key',
        name: 'timesheet_segment_id_fk',
        fields: ['segmentId'],
        references: {
          table: 'segment',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('timesheet', {
        type: 'foreign key',
        name: 'timesheet_subsegment_id_fk',
        fields: ['subSegmentId'],
        references: {
          table: 'sub_segment',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('timesheet', {
        type: 'foreign key',
        name: 'timesheet_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('timesheet', {
        type: 'foreign key',
        name: 'timesheet_approved_by_fk',
        fields: ['approvedBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('timesheet', {
        type: 'foreign key',
        name: 'timesheet_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('timesheet', {
        type: 'foreign key',
        name: 'timesheet_updated_by_fk',
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
      await queryInterface.dropTable('timesheet', { transaction: t });
    });
  }
};
