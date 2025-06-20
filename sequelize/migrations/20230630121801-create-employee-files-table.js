'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'employee_file',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          name: { type: Sequelize.STRING, allowNull: false },
          fileName: { type: Sequelize.STRING, allowNull: false },
          fileSize: { type: Sequelize.STRING, allowNull: false },
          status: { type: Sequelize.INTEGER, allowNull: false },
          folderId: { type: Sequelize.INTEGER, allowNull: false },
          employeeId: { type: Sequelize.INTEGER, allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
      await queryInterface.addConstraint('employee_file', {
        type: 'foreign key',
        name: 'employee_file_employee_id_fk',
        fields: ['employeeId'],
        references: {
          table: 'employee',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee_file', {
        type: 'foreign key',
        name: 'employee_file_folder_id_fk',
        fields: ['folderId'],
        references: {
          table: 'folder',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee_file', {
        type: 'foreign key',
        name: 'segment_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('employee_file', {
        type: 'foreign key',
        name: 'segment_updated_by_fk',
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
      await queryInterface.dropTable('employee_file', { transaction: t });
    });
  }
};
