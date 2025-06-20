'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      
      await queryInterface.createTable(
        'segment_timesheet_start_day',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          clientId: { type: Sequelize.INTEGER, allowNull: true },
          segmentId: { type: Sequelize.INTEGER, allowNull: false },
          timesheetStartDay: { type: Sequelize.INTEGER, allowNull: false },
          date: { type: Sequelize.DATE, allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );

          await queryInterface.addColumn('segment', 'timeSheetStartDay', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
          } ,{ transaction: t },);
          
      await queryInterface.addConstraint('segment_timesheet_start_day', {
        type: 'foreign key',
        name: 'segment_timesheet_start_day_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint('segment_timesheet_start_day', {
        type: 'foreign key',
        name: 'segment_timesheet_start_day_segment_id_fk',
        fields: ['segmentId'],
        references: {
          table: 'segment',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('segment_timesheet_start_day', {
        type: 'foreign key',
        name: 'segment_timesheet_start_day_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('segment_timesheet_start_day', {
        type: 'foreign key',
        name: 'segment_timesheet_start_day_updated_by_fk',
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
      await queryInterface.dropTable('segment_timesheet_start_day', { transaction: t });
      await queryInterface.removeColumn('segment', 'timeSheetStartDay', { transaction: t })
    });
  }
};
