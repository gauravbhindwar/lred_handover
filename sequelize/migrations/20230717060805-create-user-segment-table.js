'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'user_segment',
        {
          id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
          userId: { type: Sequelize.INTEGER, allowNull: false },
          clientId: { type: Sequelize.INTEGER },
          segmentId: { type: Sequelize.INTEGER },
          subSegmentId: { type: Sequelize.INTEGER },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          createdBy: { type: Sequelize.INTEGER },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
          updatedBy: { type: Sequelize.INTEGER },
          deletedAt: { type: Sequelize.DATE },
        },
        { transaction: t },
      );
      await queryInterface.addConstraint('user_segment', {
        type: 'foreign key',
        name: 'user_segment_user_id_fk',
        fields: ['userId'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('user_segment', {
        type: 'foreign key',
        name: 'user_segment_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('user_segment', {
        type: 'foreign key',
        name: 'user_segment_segment_id_fk',
        fields: ['segmentId'],
        references: {
          table: 'segment',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('user_segment', {
        type: 'foreign key',
        name: 'user_segment_sub_segment_id_fk',
        fields: ['subSegmentId'],
        references: {
          table: 'sub_segment',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('user_segment', {
        type: 'foreign key',
        name: 'user_segment_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('user_segment', {
        type: 'foreign key',
        name: 'user_segment_updated_by_fk',
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
      await queryInterface.dropTable('user_segment', { transaction: t });
    });
  }
};
