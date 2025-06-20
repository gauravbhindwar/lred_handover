'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'contract_template_version',
        {
          id: { type: Sequelize.INTEGER, allowNull: false,primaryKey: true, autoIncrement: true },
          versionNo: { type: Sequelize.INTEGER, allowNull: true },
          description: { type: Sequelize.STRING, allowNull: false },
          isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
          contractTemplateId: { type: Sequelize.INTEGER, allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
      await queryInterface.addConstraint('contract_template_version', {
        type: 'foreign key',
        name: 'contract_template_client_id_fk',
        fields: ['contractTemplateId'],
        references: {
          table: 'contract_template',
          field: 'id',
        },
        transaction: t,
      });
      
      await queryInterface.addConstraint('contract_template_version', {
        type: 'foreign key',
        name: 'contract_template_version_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('contract_template_version', {
        type: 'foreign key',
        name: 'contract_template_version_updated_by_fk',
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
      await queryInterface.dropTable('contract_template_version', { transaction: t });
    });
  }
};
