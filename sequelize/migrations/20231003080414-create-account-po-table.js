"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        "account_po",
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
          },
          timesheetId: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          type: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          poNumber: {
            type: Sequelize.STRING,
          },
          dailyRate:{
            type: Sequelize.FLOAT,
            allowNull: false,
          },
          timesheetQty:{
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          startDate:{
            type: Sequelize.DATE,
            allowNull: false,
          },
          endDate:{
            type: Sequelize.DATE,
            allowNull: false,
          },
          segmentId: { 
            type: Sequelize.INTEGER, 
            allowNull: true 
          },
          subSegmentId: { 
            type: Sequelize.INTEGER, 
            allowNull: true 
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          },
          createdBy: {
            type: Sequelize.INTEGER,
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
          },
          updatedBy: {
            type: Sequelize.INTEGER,
          },
          deletedAt: {
            type: Sequelize.DATE,
          },
        },
        { transaction: t }
      );

      await queryInterface.addConstraint("account_po", {
        type: "foreign key",
        name: "account_po_timesheet_id_fk",
        fields: ["timesheetId"],
        references: {
          table: "timesheet",
          field: "id",
        },
        transaction: t,
      });

      await queryInterface.addConstraint('account_po', {
        type: 'foreign key',
        name: 'account_po_segment_id_fk',
        fields: ['segmentId'],
        references: {
          table: 'segment',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('account_po', {
        type: 'foreign key',
        name: 'account_po_subsegment_id_fk',
        fields: ['subSegmentId'],
        references: {
          table: 'sub_segment',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint("account_po", {
        type: "foreign key",
        name: "account_po_createdBy_fk",
        fields: ["createdBy"],
        references: {
          table: "users",
          field: "id",
        },
        transaction: t,
      });

      await queryInterface.addConstraint("account_po", {
        type: "foreign key",
        name: "account_po_updated_by_fk",
        fields: ["updatedBy"],
        references: {
          table: "users",
          field: "id",
        },
        transaction: t,
      });
    });
  },
  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable("account_po", { transaction: t });
    });
  },
};
