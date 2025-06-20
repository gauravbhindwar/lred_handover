'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'client',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          code: { type: Sequelize.STRING, allowNull: false },
          name: { type: Sequelize.STRING, allowNull: false },
          country: { type: Sequelize.STRING, allowNull: false },
          isActive: { type: Sequelize.BOOLEAN, defaultValue: false },
          startDate: { type: Sequelize.DATE, allowNull: false },
          endDate: { type: Sequelize.DATE, allowNull: false },
          autoUpdateEndDate: { type: Sequelize.INTEGER },
          timeSheetStartDay: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
          approvalEmail: { type: Sequelize.STRING },
          isShowPrices: { type: Sequelize.BOOLEAN, defaultValue: false },
          isShowCostCenter: { type: Sequelize.BOOLEAN, defaultValue: false },
          isShowCatalogueNo: { type: Sequelize.BOOLEAN, defaultValue: false },
          titreDeConge: { type: Sequelize.STRING },
          isResetBalance: { type: Sequelize.BOOLEAN, defaultValue: false },
          startMonthBack: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
          medicalEmailSubmission: { type: Sequelize.STRING },
          medicalEmailToday: { type: Sequelize.STRING },
          medicalEmailMonthly: { type: Sequelize.STRING },
          isShowNSS: { type: Sequelize.BOOLEAN, defaultValue: false },
          isShowCarteChifa: { type: Sequelize.BOOLEAN, defaultValue: false },
          isShowSalaryInfo: { type: Sequelize.BOOLEAN, defaultValue: false },
          isShowRotation: { type: Sequelize.BOOLEAN, defaultValue: false },
          isShowBalance: { type: Sequelize.BOOLEAN, defaultValue: false },
          logo: { type: Sequelize.STRING },
          segment: { type: Sequelize.STRING },
          subSegment: { type: Sequelize.STRING },
          bonusType: { type: Sequelize.STRING },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
      await queryInterface.addIndex('client', {
        name: 'unique_code_uk',
        fields: ['code'],
        unique: true,
        where: {
          deletedAt: null,
        },
        transaction: t,
      });
      await queryInterface.addConstraint('client', {
        type: 'foreign key',
        name: 'client_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('client', {
        type: 'foreign key',
        name: 'client_updated_by_fk',
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
      await queryInterface.dropTable('client', { transaction: t });
    });
  }
};
