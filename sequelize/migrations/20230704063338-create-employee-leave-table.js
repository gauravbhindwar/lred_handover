'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'employee_leave',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          employeeId: { type: Sequelize.INTEGER, allowNull: false },
          reference: { type: Sequelize.STRING, allowNull: false, unique: true },
          startDate: { type: Sequelize.DATE, allowNull: false },
          endDate: { type: Sequelize.DATE, allowNull: false },
          segmentId: { type: Sequelize.INTEGER },
          rotationId: { type: Sequelize.INTEGER },
          employeeContractEndDate: { type: Sequelize.DATE },
          totalDays: { type: Sequelize.INTEGER },
          status: { type: Sequelize.ENUM('ACTIVE', 'CANCELLED'), allowNull: false, defaultValue: 'ACTIVE'},
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
      await queryInterface.addIndex('employee_leave', {
        name: 'unique_employee_leave_reference_uk',
        fields: ['reference'],
        unique: true,
        where: {
          deletedAt: null,
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee_leave', {
        type: 'foreign key',
        name: 'employee_leave_employee_id_fk',
        fields: ['employeeId'],
        references: {
          table: 'employee',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee_leave', {
        type: 'foreign key',
        name: 'employee_leave_segment_id_fk',
        fields: ['segmentId'],
        references: {
          table: 'segment',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee_leave', {
        type: 'foreign key',
        name: 'employee_leave_rotation_id_fk',
        fields: ['rotationId'],
        references: {
          table: 'rotation',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee_leave', {
        type: 'foreign key',
        name: 'employee_leave_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee_leave', {
        type: 'foreign key',
        name: 'employee_leave_updated_by_fk',
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
      await queryInterface.dropTable('employee_leave', { transaction: t });
    });
  }
};
