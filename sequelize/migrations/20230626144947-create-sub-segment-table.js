'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'sub_segment',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          segmentId: { type: Sequelize.INTEGER, allowNull: true },
          code: { type: Sequelize.STRING, allowNull: false },
          name: { type: Sequelize.STRING, allowNull: false },
          costCentre: { type: Sequelize.STRING, allowNull: true },
          fridayBonus: { type: Sequelize.INTEGER, allowNull: true },
          saturdayBonus: { type: Sequelize.INTEGER, allowNull: true },
          overtime01Bonus: { type: Sequelize.INTEGER, allowNull: true },
          overtime02Bonus: { type: Sequelize.INTEGER, allowNull: true },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
      await queryInterface.addConstraint('sub_segment', {
        type: 'foreign key',
        name: 'sub_segment_segment_id_fk',
        fields: ['segmentId'],
        references: {
          table: 'segment',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('sub_segment', {
        type: 'foreign key',
        name: 'segment_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('sub_segment', {
        type: 'foreign key',
        name: 'sub_segment_updated_by_fk',
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
      await queryInterface.dropTable('sub_segment', { transaction: t });
    });
  }
};