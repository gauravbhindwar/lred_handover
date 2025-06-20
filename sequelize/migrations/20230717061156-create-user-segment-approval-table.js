'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'user_segment_approval',
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
      await queryInterface.addConstraint('user_segment_approval', {
        type: 'foreign key',
        name: 'user_segment_approval_user_id_fk',
        fields: ['userId'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('user_segment_approval', {
        type: 'foreign key',
        name: 'user_segment_approval_client_id_fk',
        fields: ['clientId'],
        references: {
          table: 'client',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('user_segment_approval', {
        type: 'foreign key',
        name: 'user_segment_approval_segment_id_fk',
        fields: ['segmentId'],
        references: {
          table: 'segment',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('user_segment_approval', {
        type: 'foreign key',
        name: 'user_segment_approval_sub_segment_id_fk',
        fields: ['subSegmentId'],
        references: {
          table: 'sub_segment',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('user_segment_approval', {
        type: 'foreign key',
        name: 'user_segment_approval_created_by_fk',
        fields: ['createdBy'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction: t,
      });
      await queryInterface.addConstraint('user_segment_approval', {
        type: 'foreign key',
        name: 'user_segment_approval_updated_by_fk',
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
      await queryInterface.dropTable('user_segment_approval', { transaction: t });
    });
  }
};
