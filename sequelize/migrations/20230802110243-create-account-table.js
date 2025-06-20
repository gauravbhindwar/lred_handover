"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        "account",
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
          },
          clientId: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          timesheetId: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          employeeId: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          n: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          position: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          type: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          affectation: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          serviceMonth: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          monthlySalaryWithHousingAndTravel: {
            type: Sequelize.FLOAT,
            allowNull: false,
          },
          daysWorked: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          dailyCost: {
            type: Sequelize.FLOAT,
            allowNull: false,
          },
          shouldBeInvoiced: {
            type: Sequelize.FLOAT,
            allowNull: false,
          },
          invoiced: {
            type: Sequelize.FLOAT,
          },
          toBeInvoicedBack: {
            type: Sequelize.FLOAT,
          },
          poNumber: {
            type: Sequelize.STRING,
          },
          poDate: {
            type: Sequelize.DATE,
          },
          invoiceNumber: {
            type: Sequelize.STRING,
          },
          invoiceLodgingDate: {
            type: Sequelize.DATE,
          },
          invoiceAmount: {
            type: Sequelize.FLOAT,
          },
          salaryPaid: {
            type: Sequelize.FLOAT,
          },
          bonus1: {
            type: Sequelize.FLOAT,
          },
          poBonus1: {
            type: Sequelize.FLOAT,
          },
          invoiceNumberPOBonus1: {
            type: Sequelize.STRING,
          },
          bonus2: {
            type: Sequelize.FLOAT,
          },
          poBonus2: {
            type: Sequelize.FLOAT,
          },
          invoiceNumberPOBonus2: {
            type: Sequelize.STRING,
          },
          dateSalaryPaid: {
            type: Sequelize.DATE,
          },
          comments: {
            type: Sequelize.STRING,
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

      await queryInterface.addConstraint("account", {
        type: "foreign key",
        name: "account_timesheet_id_fk",
        fields: ["timesheetId"],
        references: {
          table: "timesheet",
          field: "id",
        },
        transaction: t,
      });

      await queryInterface.addConstraint('account', {
        type: 'foreign key',
        name: 'account_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });

      await queryInterface.addConstraint("account", {
        type: "foreign key",
        name: "account_createdBy_fk",
        fields: ["createdBy"],
        references: {
          table: "users",
          field: "id",
        },
        transaction: t,
      });

      await queryInterface.addConstraint("account", {
        type: "foreign key",
        name: "account_updated_by_fk",
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
      await queryInterface.dropTable("account", { transaction: t });
    });
  },
};
